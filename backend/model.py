from transformers import pipeline # type: ignore
import torch # type: ignore

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
    outputs = pipeline_instance(
        prompt,
        max_new_tokens=612,
        eos_token_id=terminators,
        do_sample=True,
        temperature=0.6,
        top_p=0.9,
    )
    return outputs[0]["generated_text"][len(prompt):]