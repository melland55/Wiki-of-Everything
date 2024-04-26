from flask import Flask, request, jsonify
from transformers import pipeline
import torch
import threading
import queue
import mysql.connector

app = Flask(__name__)

# MySQL configuration
mysql_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'WikiOfEverything'
}

# Task Queue
task_queue = queue.Queue()

# Load the LLM model
print("Loading Model...")
model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
pipeline_instance = pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device="cuda",
)
print("Model Loaded")

# Worker for scheduling LLM Tasks
def worker():
    while True:
        messages, response_queue = task_queue.get()  # Wait for a task to be added to the queue
        response = runLLM(messages)
        response_queue.put(response)  # Put the response into the response queue
        task_queue.task_done()  # Mark the task as done

# Runs the prompt messages through the LLM
def runLLM(messages):
    prompt = pipeline_instance.tokenizer.apply_chat_template(
            messages, 
            tokenize=False, 
            add_generation_prompt=True
        )
    terminators = [
        pipeline_instance.tokenizer.eos_token_id,
        pipeline_instance.tokenizer.convert_tokens_to_ids("<|eot_id|>")
    ]
    print("running LLM")
    print(messages)
    outputs = pipeline_instance(
        prompt,
        max_new_tokens=612,
        eos_token_id=terminators,
        do_sample=True,
        temperature=0.6,
        top_p=0.9,
    )
    print(outputs[0]["generated_text"][len(prompt):])
    return outputs[0]["generated_text"][len(prompt):]


def generate_summary(word):
    messages = [
        {"role": "system", "content": "You are a wikipedia bot that gives me a wiki summary of whatever I say. You will wrap any words that should link to other wiki pages with empty <a> tags with no href. End the response with just a list of **Section titles:** that a wiki would normally have."},
        {"role": "user", "content": word},
    ]
    response_queue = queue.Queue()  # Create a queue to receive the response
    task_queue.put((messages, response_queue))
    response = response_queue.get()  # Wait for the response from the worker
    response_object = {"summary": "", "sections": []}

    # Extract everything before section titles as summary
    summary_end = response.find("**Section titles:**")
    summary = response[:summary_end].strip()
    response_object["summary"] = summary # Remove leading/trailing whitespace
    
    # Extract section titles
    section_titles_start = response.find("**Section titles:**\n") + len("**Section titles:**")
    section_titles = response[section_titles_start:].strip().split("* ")[1:]
    
    # Create sections with empty content
    for title in section_titles:
        response_object["sections"].append({"title": title.strip(), "content": ""})
        
    return response_object

def generate_section_content(word, section, summary):
    messages = [
        {"role": "system", "content": "You are a wikipedia bot that gives me a wiki section of whatever word with summary and section topic I say. You will wrap any words in the section that should link to other wiki pages with empty <a> tags with no href."},
        {"role": "user", "content": "Word: " + word + ", Summary: " + summary + ", Section Title: " + section},
    ]
    response_queue = queue.Queue()  # Create a queue to receive the response
    task_queue.put((messages, response_queue))
    response = response_queue.get()  # Wait for the response from the worker
    return response

# Start the worker thread
worker_thread = threading.Thread(target=worker)
worker_thread.daemon = True
worker_thread.start()

@app.route('/get-summary/<word>', methods=['POST'])
def get_summary(word):
    if request.method == 'POST':

        conn = mysql.connector.connect(**mysql_config)
        cursor = conn.cursor()

        query = "SELECT summary, section_title, section_content,section_order  FROM Topics INNER JOIN Sections ON Topics.topic_id=Sections.topic_id WHERE Topics.topic LIKE %s"
        cursor.execute(query, (word,))
        rows = cursor.fetchall()
        if rows:
            response_object = {"summary": "", "sections": []}
            response_object["summary"] = rows[0][0]
            for row in rows:
                response_object["sections"].append({"title": row[1], "content": row[2]})
            return jsonify({"response": response_object})
        else:
            response = generate_summary(word)
            cursor.execute("INSERT INTO Topics (topic, summary) VALUES (%s, %s)", (word, response["summary"]))
            topic_id = cursor.lastrowid

            i = 1
            for section in response["sections"]:
                cursor.execute("INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (%s, %s, %s, %s)",
                                (topic_id, section["title"], "", i))
                i=i+1
            
            conn.commit()
            return jsonify({"response": response})
    else:
        return jsonify({'error': 'Invalid request method'})
    
@app.route('/<word>/get-section/<section>', methods=['POST'])
def get_section(word, section):
    if request.method == 'POST':
        conn = mysql.connector.connect(**mysql_config)
        cursor = conn.cursor()

        query = "SELECT summary, section_title, section_content, section_id FROM Topics INNER JOIN Sections ON Topics.topic_id=Sections.topic_id WHERE Topics.topic LIKE %s AND Sections.section_title=%s"
        cursor.execute(query, (word, section))
        rows = cursor.fetchall()
        print(rows)
        if rows[0][2]:
            response_object = {"title": section, "content": rows[0][2]}
            return jsonify({"response": response_object})
        else:
            response = generate_section_content(word, section, rows[0][2])
            cursor.execute("UPDATE Sections SET section_content = %s WHERE section_id = %s", (response, rows[0][3]))
            #cursor.execute("INSERT INTO Topics (topic, summary) VALUES (%s, %s)", (word, response["summary"]))

            conn.commit()
            return jsonify({"response": response})
    else:
        return jsonify({'error': 'Invalid request method'})

if __name__ == '__main__':
    app.run(debug=True)
