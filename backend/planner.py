from groq import Groq
from typing import Generator, List


def build_prompt(
    destination: str,
    days: int,
    budget: str,
    styles: List[str],
    travelers: int,
    dietary: List[str],
) -> str:
    style_str = ", ".join(styles) if styles else "general sightseeing"
    dietary_str = (
        "Dietary requirements: " + ", ".join(dietary)
        if dietary
        else "No dietary restrictions"
    )

    return f"""You are an expert travel planner with deep knowledge of destinations worldwide.

Create a detailed, practical {days}-day itinerary for {travelers} traveler(s) visiting {destination}.

Trip preferences:
- Budget level: {budget}
- Travel style: {style_str}
- Travelers: {travelers} person(s)
- {dietary_str}

IMPORTANT FORMATTING RULES:
1. For every activity, write the name inside [square brackets] — e.g. 🎯 [Senso-ji Temple]
2. For every restaurant, write the name inside [square brackets] — e.g. 🍽️ [Ichiran Ramen Shibuya]
3. Always respect the dietary requirements when recommending restaurants.
4. Include cuisine type and a note about dietary suitability for each restaurant.

Format EXACTLY like this for each day:

## Day 1: [Descriptive Theme]

**Morning**
🎯 [Activity or Place Name] — Brief description of what to do/see there
🎯 [Activity or Place Name] — Brief description
💰 Estimated: $X per person

**Afternoon**
🎯 [Activity or Place Name] — Brief description
🍽️ [Restaurant Name] — Cuisine type, price range, dietary notes
💰 Estimated: $X per person

**Evening**
🍽️ [Restaurant Name] — Cuisine type, known for, dietary notes
🎯 [Evening Activity Name] — Brief description
💰 Estimated: $X per person

---

[Repeat for each day]

After all days include:

## 💰 Budget Breakdown
- Total per person per day: $X–$X
- Accommodation: $X–$X/night
- Food: $X–$X/day
- Activities & Transport: $X–$X/day

## 🏨 Where to Stay
- [Hotel or Neighborhood 1] — Brief description, price range
- [Hotel or Neighborhood 2] — Brief description, price range
- [Hotel or Neighborhood 3] — Brief description, price range

## 🚌 Getting Around
- [Transport tip 1]
- [Transport tip 2]
- [Transport tip 3]

## 💡 Local Tips
- [Tip 1]
- [Tip 2]
- [Tip 3]
- [Tip 4]
- [Tip 5]

## ☀️ Weather & Best Time
- Typical weather during visit: [temperature range and conditions]
- Best months to visit: [months]
- What to pack: [key items]

Be specific with real place names. Always use [square brackets] around every activity and restaurant name."""


def stream_itinerary(
    destination: str,
    days: int,
    budget: str,
    styles: List[str],
    travelers: int,
    dietary: List[str],
    api_key: str,
) -> Generator:
    client = Groq(api_key=api_key)
    prompt = build_prompt(destination, days, budget, styles, travelers, dietary)

    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
        temperature=0.7,
        max_tokens=4000,
    )

    for chunk in stream:
        content = chunk.choices[0].delta.content
        if content:
            yield content
