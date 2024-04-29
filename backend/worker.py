import threading
import queue
from model import runLLM

# Task Queue
task_queue = queue.Queue()
completed_tasks = set()
last = {}

# Worker for scheduling LLM Tasks
def worker():
    while True:
        messages, response_queue = task_queue.get()  # Wait for a task to be added to the queue
        task_id = messages[1]["content"]
        if task_id in completed_tasks:
            print(f"Skipping duplicate task: {task_id}")
            response_queue.put(last)  # Signal completion even for skipped tasks
            task_queue.task_done()
            continue

        completed_tasks.add(task_id)  # Add task ID to seen set after processing

        response = runLLM(messages)
        last = response
        response_queue.put(response)  # Put the response into the response queue
        task_queue.task_done()  # Mark the task as done

def queue_task(messages):
    response_queue = queue.Queue()  # Create a queue to receive the response
    task_queue.put((messages, response_queue))
    response = response_queue.get()  # Wait for the response from the worker
    return response

# Start the worker thread
worker_thread = threading.Thread(target=worker)
worker_thread.daemon = True
worker_thread.start()