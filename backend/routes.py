from flask import request, jsonify # type: ignore
from worker import queue_task
from database import db_pool
import re

def add_links(cursor, topic_id, summary):
    pattern = r'<a>(.*?)</a>'
    links = re.findall(pattern, summary)
    for dest_topic in links:
        # Check if the destination topic exists
        cursor.execute("SELECT topic_id FROM Topics WHERE topic LIKE %s", (dest_topic,))
        dest_topic_id = cursor.fetchone()
        
        # If the destination topic doesn't exist, create it
        if not dest_topic_id:
            cursor.execute("INSERT INTO Topics (topic, link_count) VALUES (%s, 0)", (dest_topic,))
            dest_topic_id = cursor.lastrowid
        else:
            dest_topic_id = dest_topic_id[0]

        # Add connection from source topic to destination topic in Links table
        cursor.execute("INSERT INTO Links (source_id, destination_id) VALUES (%s, %s)", (topic_id, dest_topic_id))
        cursor.execute("UPDATE Topics SET link_count = link_count + 1 WHERE topic_id LIKE %s", (dest_topic_id,))


def generate_summary(word):
    messages = [
        {"role": "system", "content": "You are a wikipedia bot that gives me a detailed wiki summary of whatever I say. You will wrap any words that should link to other wiki pages except the topic word with empty <a> tags with no href. End the response with just a list of **Section titles:** that a wiki would normally have. Make sure to wrap multiple topics with <a> tags."},
        {"role": "user", "content": word},
    ]
    
    response = queue_task(messages)
    if response is None:
        return None
    response_object = {"summary": "", "sections": []}

    # Extract everything before section titles as summary
    summary_end = response.find("**Section titles:**")
    summary = response[:summary_end]
    response_object["summary"] = summary # Remove leading/trailing whitespace
    
    # Extract section titles
    section_titles_start = response.find("**Section titles:**\n") + len("**Section titles:**")
    section_titles = response[section_titles_start:].strip().split("* ")[1:]
    
    exclude_title = ["references","external links", "see more", "see also"]

    # Create sections with empty content
    for title in section_titles:
        if title.lower() not in exclude_title:
            response_object["sections"].append({"title": title.strip(), "content": ""})
        
    return response_object

def generate_section_content(word, section):
    messages = [
        {"role": "system", "content": "You are a wikipedia bot that gives me just a detailed wiki section of whatever **word** and section topic I say. You will wrap any words in the section that should link to other wiki pages with empty <a> tags with no href."},
        {"role": "user", "content": "Word: " + word + ", Section Title: " + section},
    ]
    
    response = queue_task(messages)
    content_start = response.find("**"+ section +"**")
    if content_start != -1:
        content_start += len("**" + section + "**")
        return response[content_start:].strip()
    else:
        return response
    
def setup_routes(app):
    @app.route('/get-summary/<word>', methods=['POST'])
    def get_summary(word):
        if request.method == 'POST':
            conn = db_pool.get_connection()
            cursor = conn.cursor()
            query = "SELECT section_title, section_content, section_order, Topics.topic_id FROM Topics LEFT OUTER JOIN Sections ON Topics.topic_id=Sections.topic_id WHERE Topics.topic LIKE %s ORDER BY section_order"
            cursor.execute(query, (word,))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            if rows and rows[0][0]:
                response_object = {"summary": "", "sections": []}
                response_object["summary"] = rows[0][1]
                for row in rows[1:]:
                    response_object["sections"].append({"title": row[0], "content": row[1]})
                return jsonify({"response": response_object})

            else:
                response = generate_summary(word)
                if response is None:
                    return jsonify("Loading")
                
                conn = db_pool.get_connection()
                cursor = conn.cursor()

                topic_id = 0
                if rows:
                    topic_id = rows[0][3]
                    cursor.execute("INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (%s, %s, %s, %s)",
                                    (topic_id, "Summary", response["summary"], 0))
                else:
                    cursor.execute("INSERT INTO Topics (topic) VALUES (%s)", (word,))
                    topic_id = cursor.lastrowid
                    cursor.execute("INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (%s, %s, %s, %s)",
                                    (topic_id, "Summary", response["summary"], 0))

                i = 1
                for section in response["sections"]:
                    cursor.execute("INSERT INTO Sections (topic_id, section_title, section_content, section_order) VALUES (%s, %s, %s, %s)",
                                    (topic_id, section["title"], "", i))
                    i += 1
                add_links(cursor, topic_id, response["summary"])
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"response": response})
        else:
            return jsonify({'error': 'Invalid request method'})

    @app.route('/<word>/get-section/<section>', methods=['POST'])
    def get_section(word, section):
        if request.method == 'POST':
            conn = db_pool.get_connection()
            cursor = conn.cursor()
            query = "SELECT section_title, section_content, section_id FROM Topics INNER JOIN Sections ON Topics.topic_id=Sections.topic_id WHERE Topics.topic LIKE %s AND Sections.section_title=%s"
            cursor.execute(query, (word, section))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()
            if rows and rows[0][1]:
                response_object = {"title": section, "content": rows[0][1]}
                return jsonify({"response": response_object})
            else:
                response = generate_section_content(word, section)
                conn = db_pool.get_connection()
                cursor = conn.cursor()
                cursor.execute("UPDATE Sections SET section_content = %s WHERE section_id = %s", (response, rows[0][2]))
                conn.commit()
                cursor.close()
                conn.close()
                return jsonify({"response": response})
        else:
            return jsonify({'error': 'Invalid request method'})
        
    @app.route('/get-topics', methods=['GET'])
    def get_topics():
        if request.method == 'GET':
            with db_pool.get_connection() as conn:
                with conn.cursor() as cursor:

                    query = "SELECT topic, CASE WHEN section_content IS NOT NULL THEN 1 ELSE 0 END AS has_summary FROM topics LEFT OUTER JOIN Sections ON Topics.topic_id=Sections.topic_id AND Sections.section_title='Summary'"
                    cursor.execute(query)
                    rows = cursor.fetchall()
                    
                    return jsonify({"response": rows})
        else:
            return jsonify({'error': 'Invalid request method'})
        
    @app.route('/get-graph', methods=['GET'])
    def get_graph():
        if request.method == 'GET':
            with db_pool.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "SELECT topic_id, topic, link_count FROM Topics"
                    cursor.execute(query)
                    rows = cursor.fetchall()

                    response_object = {"nodes": [], "links":[]}
                    for row in rows:
                        response_object["nodes"].append({"id": row[0], "name": row[1], "val": row[2], "label": row[1]})


                    query = "SELECT source_id, destination_id FROM Links"
                    cursor.execute(query)
                    rows = cursor.fetchall()

                    for row in rows:
                        response_object["links"].append({"source": row[0], "target": row[1]})
                    
                    return jsonify({"response": response_object})
        else:
            return jsonify({'error': 'Invalid request method'})
