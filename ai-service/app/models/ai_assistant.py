import random

class AITransitAssistant:
    def answer_query(self, user_prompt: str, language: str = 'en') -> dict:
        prompt = user_prompt.lower()

        is_tamil = language == 'ta' or any(c in prompt for c in ['எப்படி', 'பேருந்து', 'எங்கு', 'எப்பொழுது'])

        if 't nagar' in prompt or 'தி. நகர்' in prompt:
            if is_tamil:
                response = "தி. நகர் செல்ல பேருந்து 23C அல்லது 11G சிறந்த தேர்வாகும். தற்போதைய பேருந்து 5 நிமிடங்களில் அசோக் தூண் நிறுத்தத்திற்கு வரும்."
            else:
                response = "To reach T. Nagar, board MTC Bus 23C or 11G. Live Bus 23C is currently 5 minutes away from your nearest stop (Ashok Pillar)."
        elif 'crowded' in prompt or 'கூட்டம்' in prompt:
            if is_tamil:
                response = "பேருந்து 570 தற்போது நடுத்தர கூட்டத்துடன் இயங்குகிறது (தோராயமாக 55% ஆக்கிரமிப்பு). அமர இருக்கைகள் கிடைக்க வாய்ப்புள்ளது."
            else:
                response = "MTC Bus 570 currently has moderate crowding (~55% occupancy). Seats are likely available."
        elif 'auto' in prompt or 'ஆட்டோ' in prompt:
            if is_tamil:
                response = "நடக்கும் தூரம் 900மீக்கு மேல் உள்ளதால், ரூ.45 கட்டணத்தில் ஆட்டோ மூலம் பேருந்து நிலையத்திற்குச் செல்வது 12 நிமிடங்களைச் சேமிக்கும்."
            else:
                response = "Since walking distance is over 900m, taking an auto to Vadapalani Bus Depot (approx. Rs. 45) saves 12 minutes of walking in current weather."
        else:
            if is_tamil:
                response = "வணக்கம்! தமிழ்நாட்டின் சிறந்த பேருந்து வழிகாட்டல் சேவைக்கு உங்களை வரவேற்கிறோம். நீங்கள் செல்ல வேண்டிய இடத்தைக் கூறினால் நேரலை பேருந்து விவரங்களை அளிக்கிறேன்."
            else:
                response = "Hello! I am your Where is my bus assistant. Tell me your destination and I will analyze live MTC & TNSTC buses, traffic, and optimal boarding stops for you."

        return {
            "query": user_prompt,
            "response": response,
            "language": "ta" if is_tamil else "en",
            "suggested_actions": ["Show Live Map", "Plan Route", "Share Live Location"]
        }

ai_assistant = AITransitAssistant()
