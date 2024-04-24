from flask import Flask, request, jsonify
from transformers import pipeline
import torch

app = Flask(__name__)

# Load the LLM model
print("Loading Model...")
model_id = "meta-llama/Meta-Llama-3-8B-Instruct"
pipeline = pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device="cuda",
)
print("Model Loaded")

def runLLM(messages):
    prompt = pipeline.tokenizer.apply_chat_template(
            messages, 
            tokenize=False, 
            add_generation_prompt=True
        )

    terminators = [
        pipeline.tokenizer.eos_token_id,
        pipeline.tokenizer.convert_tokens_to_ids("<|eot_id|>")
    ]
    print("running LLM")
    outputs = pipeline(
        prompt,
        max_new_tokens=612,
        eos_token_id=terminators,
        do_sample=True,
        temperature=0.6,
        top_p=0.9,
    )

    return outputs[0]["generated_text"][len(prompt):]

@app.route('/query-word/<word>', methods=['POST'])
def query_word(word):
    if request.method == 'POST':
        print("request recieved")
        # Run the word through the LLM
        messages = [
            {"role": "system", "content": "You are a wikipedia bot that gives me a wiki summary of whatever I say. Also wrap the words with empty <a> tags that should link to other wiki pages, with no href. End the response with just a list of section titles that a wiki would normally have."},
            {"role": "user", "content": word},
        ]

        response = runLLM(messages)
        return jsonify({'response': response})
    else:
        return jsonify({'error': 'Invalid request method'})

if __name__ == '__main__':
    app.run(debug=True)
