import threading
import queue
from model import runLLM

# Task Queue
task_queue = queue.Queue()

# Worker for scheduling LLM Tasks
def worker():
    while True:
        messages, response_queue = task_queue.get()  # Wait for a task to be added to the queue
        response = runLLM(messages)
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
