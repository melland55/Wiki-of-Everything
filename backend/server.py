from flask import Flask, request, jsonify
from transformers import pipeline
import torch
import threading
import queue

app = Flask(__name__)
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

    eos_token_id = pipeline_instance.tokenizer.eos_token_id  # Retrieve EOS token ID
    terminators = [
        eos_token_id,
        pipeline_instance.tokenizer.convert_tokens_to_ids("")
    ]
    print("running LLM")
    print(messages)
    outputs = pipeline_instance(
        prompt,
        max_new_tokens=612,
        eos_token_id=eos_token_id,  # Use EOS token ID
        do_sample=True,
        temperature=0.6,
        top_p=0.9,
    )
    print(outputs[0]["generated_text"][len(prompt):])
    return outputs[0]["generated_text"][len(prompt):]

# Start the worker thread
worker_thread = threading.Thread(target=worker)
worker_thread.daemon = True
worker_thread.start()

@app.route('/query-word/<word>', methods=['POST'])
def query_word(word):
    if request.method == 'POST':
        print("request received")
        # Queue the task
        messages = [
            {"role": "system", "content": "You are a wikipedia bot that gives me a wiki summary of whatever I say. Also wrap the words with empty <a> tags that should link to other wiki pages, with no href. End the response with just a list of section titles that a wiki would normally have."},
            {"role": "user", "content": word},
        ]
        response_queue = queue.Queue()  # Create a queue to receive the response
        task_queue.put((messages, response_queue))
        response = response_queue.get()  # Wait for the response from the worker
        return jsonify({'response': response})
    else:
        return jsonify({'error': 'Invalid request method'})

if __name__ == '__main__':
    app.run(debug=True)
