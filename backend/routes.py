from flask import request, jsonify # type: ignore
from worker import queue_task # type: ignore
from database import db_pool

def generate_summary(word):
    messages = [
        {"role": "system", "content": "You are a wikipedia bot that gives me a wiki summary of whatever I say. You will wrap any words that should link to other wiki pages with empty <a> tags with no href. End the response with just a list of **Section titles:** that a wiki would normally have."},
        {"role": "user", "content": word},
    ]
    
    response = queue_task(messages)
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
    
    response = queue_task(messages)
    return response
    


def setup_routes(app):
    @app.route('/get-summary/<word>', methods=['POST'])
    def get_summary(word):
        if request.method == 'POST':

            conn = db_pool.get_connection()
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
            conn = db_pool.get_connection()
            cursor = conn.cursor()

            query = "SELECT summary, section_title, section_content, section_id FROM Topics INNER JOIN Sections ON Topics.topic_id=Sections.topic_id WHERE Topics.topic LIKE %s AND Sections.section_title=%s"
            cursor.execute(query, (word, section))
            rows = cursor.fetchall()
            if rows[0][2]:
                response_object = {"title": section, "content": rows[0][2]}
                return jsonify({"response": response_object})
            else:
                response = generate_section_content(word, section, rows[0][2])
                cursor.execute("UPDATE Sections SET section_content = %s WHERE section_id = %s", (response, rows[0][3]))

                conn.commit()
                return jsonify({"response": response})
        else:
            return jsonify({'error': 'Invalid request method'})