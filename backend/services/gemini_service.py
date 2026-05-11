import os
import google.generativeai as genai
import requests
import base64
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_3d_prompt_for_product(product_name: str, image_url: str):
    """
    Amazon'dan çekilen ürünün görselini ve başlığını Gemini AI'ya vererek,
    Tripo3D gibi servislerin anlayabileceği maksimum kalitede,
    İngilizce bir Text-to-3D prompt'u oluşturur.
    """
    if not GEMINI_API_KEY:
        print("UYARI: GEMINI API KEY bulunamadı. Standart bir prompt dönülüyor.")
        return f"A high-quality 3D model of {product_name}, modern style, detailed texture"
        
    try:
        # Görseli RAM'e indir (Amazon Engellemelerine Karşı User-Agent ekliyoruz)
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        img_response = requests.get(image_url, headers=headers, timeout=10)
        img_response.raise_for_status()
        img_data = img_response.content
        mime_type = img_response.headers.get("Content-Type", "image/jpeg")
        
        prompt_instruction = f"""
        You are an expert 3D modeling prompt engineer. 
        I have a product named: '{product_name}'.
        Please analyze the attached image of this product. I need you to write a highly detailed, descriptive text prompt (in English) that will be used to generate a 3D model of this exact product using a text-to-3D AI service (like Tripo3D/Shap-E).
        
        Focus on:
        - The exact shape, geometry, and structure of the item.
        - Materials (e.g., wood, metal, fabric, leather, glass) and their textures.
        - Colors and specific styling (e.g., modern, vintage, minimalist, ergonomic).
        - Dimensions or proportions relative to itself.
        - Lighting or rendering keywords that help create a realistic 3D model (e.g., physically based rendering, 8k resolution, photorealistic).
        
        Keep it concise but highly descriptive (around 2-4 sentences max). Do not include any conversational text, just return the prompt.
        """
        
        # Güncel Gemini Modeli (v2.5 Flash Hızlı ve Görsel İşleyebilen Sürüm)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Görseli base64 gibi vermektense Gemini'ye Part objesi olarak veriyoruz
        image_part = {
            "mime_type": mime_type,
            "data": img_data
        }
        
        response = model.generate_content([prompt_instruction, image_part])
        
        if response.text:
            generated_prompt = response.text.strip()
            print(f"Gemini Prompt Üretti: {generated_prompt}")
            return generated_prompt
        else:
            return f"A 3d model of a {product_name}"
            
    except Exception as e:
        print(f"Gemini AI Prompt Oluşturma Hatası: {e}")
        return f"A 3D model of a highly detailed {product_name}"


def generate_custom_design_prompt(product_name: str, image_url: str, user_prompt: str):
    """
    Kullanıcının girdiği isteğe göre mevcut mobilyayı yeniden tasarlamak için Tripo3D uyumlu prompt üretir.
    """
    if not GEMINI_API_KEY:
        return f"A 3D model of {product_name}, modified: {user_prompt}"
        
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        img_response = requests.get(image_url, headers=headers, timeout=10)
        img_response.raise_for_status()
        img_data = img_response.content
        mime_type = img_response.headers.get("Content-Type", "image/jpeg")
        
        prompt_instruction = f"""
        You are an expert 3D modeling prompt engineer. 
        I have a product named: '{product_name}'.
        Please analyze the attached image of this product.
        The user wants to modify this product with the following instructions: "{user_prompt}"
        
        Write a highly detailed, descriptive text prompt (in English) to generate a NEW 3D model based on the user's modifications.
        Keep the original core structure unless the user changed it. Focus on the requested changes (materials, colors, shape).
        Include lighting or rendering keywords that help create a realistic 3D model (e.g., physically based rendering, 8k resolution, photorealistic).
        
        Keep it concise but highly descriptive (around 2-3 sentences max). Do not include any conversational text, just return the prompt string.
        """
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        image_part = {
            "mime_type": mime_type,
            "data": img_data
        }
        
        response = model.generate_content([prompt_instruction, image_part])
        
        if response.text:
            return response.text.strip()
        else:
            return f"A 3D model of {product_name}, with design changes: {user_prompt}"
            
    except Exception as e:
        print(f"Gemini Custom AI Prompt Hatası: {e}")
        return f"A 3D model of {product_name}, with design changes: {user_prompt}"
