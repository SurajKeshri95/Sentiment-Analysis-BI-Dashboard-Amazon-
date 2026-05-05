# sentiment_pipeline.py
"""
A simple Python translation of the provided JS sentiment demo.
Features:
- sample dataset load
- add custom lines of reviews
- clear data
- preprocess (clean, tokenize, stopword removal, simple stemming)
- lexicon-based sentiment classification with confidence scores
- compute basic performance-style metrics (simulated)
- create a doughnut chart using matplotlib
- generate a text report
"""

import re
import random
import math
from collections import Counter
from typing import List, Dict, Any

import pandas as pd
import matplotlib.pyplot as plt

# --- Configuration / Lexicons (mirrors the JS lists) ---
SAMPLE_DATASET = [
    "This product is absolutely amazing! Best purchase ever!",
    "Terrible quality, waste of money. Very disappointed.",
    "The service was okay, nothing special but not bad either.",
    "Love this so much! Highly recommend to everyone!",
    "Poor customer service, took forever to respond.",
    "Great value for money, satisfied with the purchase.",
    "Not what I expected, but it's decent enough.",
    "Outstanding quality! Exceeded my expectations completely.",
    "Had some issues but customer support was helpful.",
    "Perfect! Exactly what I was looking for.",
    "Overpriced for what you get, not worth it.",
    "Good product overall, would buy again.",
    "Shipping was slow but product quality is excellent.",
    "Average product, nothing to complain about.",
    "Fantastic experience from start to finish!",
    "Quality could be better for this price point.",
    "Really happy with this purchase, great quality!",
    "Not impressed, expected much better quality.",
    "Decent product, does what it's supposed to do.",
    "Absolutely love it! Will definitely recommend!"
]

POSITIVE_WORDS = {'amazing', 'love', 'great', 'excellent', 'fantastic', 'perfect',
                  'outstanding', 'happy', 'satisfied', 'recommend', 'best',
                  'wonderful', 'awesome', 'good', 'nice', 'beautiful', 'brilliant'}

NEGATIVE_WORDS = {'terrible', 'awful', 'bad', 'horrible', 'disappointed', 'poor',
                  'waste', 'worst', 'hate', 'disgusting', 'useless', 'annoying',
                  'frustrating', 'slow', 'overpriced'}

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'very', 'so',
    'not', "it's", "its", 'me', 'my', 'your'
}

# --- Global state (simple module-level) ---
raw_data: List[str] = []
preprocessed_data: List[Dict[str, Any]] = []
sentiment_results: List[Dict[str, Any]] = []


# --- Functions matching the JS behavior --- #
def load_sample_data():
    global raw_data
    raw_data = SAMPLE_DATASET.copy()
    print(f"Loaded {len(raw_data)} sample texts.")


def add_custom_data(multiline_text: str):
    """Accepts a multi-line string; each non-empty line is appended as one review."""
    global raw_data
    lines = [line.strip() for line in multiline_text.splitlines() if line.strip()]
    raw_data.extend(lines)
    print(f"Added {len(lines)} custom texts. Total now: {len(raw_data)}")


def clear_data():
    global raw_data, preprocessed_data, sentiment_results
    raw_data = []
    preprocessed_data = []
    sentiment_results = []
    print("Cleared all data.")


def update_data_stats() -> Dict[str, Any]:
    total_texts = len(raw_data)
    avg_length = round(sum(len(t) for t in raw_data) / total_texts) if total_texts else 0
    stats = {"total_texts": total_texts, "avg_length": avg_length}
    print(f"Data stats: {stats}")
    return stats


def simple_stem(token: str) -> str:
    if token.endswith('ing') and len(token) > 4:
        return token[:-3]
    if token.endswith('ed') and len(token) > 3:
        return token[:-2]
    if token.endswith('er') and len(token) > 3:
        return token[:-2]
    if token.endswith('ly') and len(token) > 3:
        return token[:-2]
    return token


def preprocess_data():
    """
    Produce preprocessed_data list of dicts:
    { 'original': ..., 'processed': 'tok1 tok2', 'tokens': [...] }
    """
    global preprocessed_data
    if not raw_data:
        raise ValueError("No raw data to preprocess. Load or add data first.")

    processed_list = []
    for text in raw_data:
        # cleaning (lowercase, remove punctuation except spaces)
        cleaned = text.lower()
        cleaned = re.sub(r"[^\w\s]", " ", cleaned)  # replace punctuation with space
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        # tokenization
        tokens = cleaned.split()

        # stopwords removal & min length > 2
        tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]

        # simple stemming
        tokens = [simple_stem(t) for t in tokens]

        processed_list.append({
            "original": text,
            "processed": " ".join(tokens),
            "tokens": tokens
        })

    preprocessed_data = processed_list
    # print one sample like the JS demo
    if preprocessed_data:
        sample = preprocessed_data[0]
        print("Sample preprocessing result:")
        print(f" Original: {sample['original']}")
        print(f" Processed: {sample['processed']}")
        print(f" Tokens: {sample['tokens']}")
    return preprocessed_data


def classify_sentiments():
    """
    Lexicon based sentiment classification.
    Output sentiment_results list with fields:
    original, processed, sentiment, confidence, positiveScore, negativeScore
    """
    global sentiment_results
    if not preprocessed_data:
        raise ValueError("No preprocessed data. Run preprocess_data() first.")

    results = []
    for item in preprocessed_data:
        tokens = item["tokens"]
        pos_score = sum(1 for t in tokens if t in POSITIVE_WORDS)
        neg_score = sum(1 for t in tokens if t in NEGATIVE_WORDS)

        if pos_score > neg_score:
            sentiment = "positive"
            confidence = min(0.95, 0.6 + (pos_score - neg_score) * 0.1)
        elif neg_score > pos_score:
            sentiment = "negative"
            confidence = min(0.95, 0.6 + (neg_score - pos_score) * 0.1)
        else:
            sentiment = "neutral"
            confidence = 0.5 + random.random() * 0.3

        results.append({
            "original": item["original"],
            "processed": item["processed"],
            "sentiment": sentiment,
            "confidence": round(confidence, 3),
            "positiveScore": pos_score,
            "negativeScore": neg_score
        })

    sentiment_results = results

    # display first 6 like the JS UI
    print("Classification results (first 6):")
    for idx, r in enumerate(sentiment_results[:6], 1):
        print(f"[{idx}] Sentiment: {r['sentiment'].upper()} | Conf: {r['confidence']*100:.1f}% | Pos:{r['positiveScore']} Neg:{r['negativeScore']}")
        print(f"    Text: {r['original'][:120]}")

    return sentiment_results


def update_performance_metrics() -> Dict[str, float]:
    """
    Simulate metrics (since there is no ground truth). Mirrors JS:
    accuracy ~ 85-95, precision ~ 82-94, recall ~ 88-96, f1 computed.
    """
    accuracy = 85 + random.random() * 10
    precision = 82 + random.random() * 12
    recall = 88 + random.random() * 8
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) else 0.0

    metrics = {
        "accuracy": round(accuracy, 1),
        "precision": round(precision, 1),
        "recall": round(recall, 1),
        "f1_score": round(f1, 1)
    }
    print("Performance metrics (simulated):", metrics)
    return metrics


def create_sentiment_chart(show: bool = True, save_path: str = None):
    """
    Create a doughnut (pie) chart of sentiment distribution using matplotlib.
    - show: whether to call plt.show()
    - save_path: if provided, saves to the path (e.g., 'sentiment_doughnut.png')
    """
    if not sentiment_results:
        raise ValueError("No sentiment results. Run classify_sentiments() first.")

    counts = Counter(r['sentiment'] for r in sentiment_results)
    labels = ['Positive', 'Negative', 'Neutral']
    sizes = [counts.get('positive', 0), counts.get('negative', 0), counts.get('neutral', 0)]

    # make a doughnut
    fig, ax = plt.subplots(figsize=(6, 4))
    wedges, texts, autotexts = ax.pie(sizes,
                                      labels=labels,
                                      autopct=lambda pct: f"{int(round(pct*sum(sizes)/100))}" if sum(sizes) else "0",
                                      startangle=90,
                                      wedgeprops=dict(width=0.5, edgecolor='w'))

    ax.set(aspect="equal", title="Sentiment Distribution")
    if save_path:
        plt.savefig(save_path, bbox_inches='tight')
        print(f"Saved chart to: {save_path}")
    if show:
        plt.show()
    plt.close(fig)


def generate_report() -> str:
    """
    Returns a textual report string summarizing analysis and recommendations.
    """
    if not sentiment_results:
        raise ValueError("No sentiment results. Run classify_sentiments() first.")

    total = len(sentiment_results)
    positive = sum(1 for r in sentiment_results if r['sentiment'] == 'positive')
    negative = sum(1 for r in sentiment_results if r['sentiment'] == 'negative')
    neutral = sum(1 for r in sentiment_results if r['sentiment'] == 'neutral')
    avg_conf = sum(r['confidence'] for r in sentiment_results) / total * 100

    dominance = ("Overall positive sentiment dominates" if positive > negative
                 else "Overall negative sentiment dominates" if negative > positive
                 else "Balanced sentiment distribution")

    confidence_text = ("High confidence in classifications" if avg_conf > 80
                       else "Moderate confidence in classifications" if avg_conf > 60
                       else "Lower confidence suggests need for model improvement")

    most_common = ("Positive" if positive >= negative and positive >= neutral
                   else "Negative" if negative >= positive and negative >= neutral
                   else "Neutral")

    recommend = ("Leverage positive feedback for marketing" if positive > total * 0.6
                 else "Address negative feedback concerns" if negative > total * 0.4
                 else "Monitor sentiment trends over time")

    report = (
        f"Dataset Analysis Summary:\n"
        f" • Total texts analyzed: {total}\n"
        f" • Positive sentiment: {positive} ({positive/total*100:.1f}%)\n"
        f" • Negative sentiment: {negative} ({negative/total*100:.1f}%)\n"
        f" • Neutral sentiment: {neutral} ({neutral/total*100:.1f}%)\n"
        f" • Average confidence: {avg_conf:.1f}%\n\n"
        f"Key Insights:\n"
        f" • {dominance}\n"
        f" • {confidence_text}\n"
        f" • Most common sentiment: {most_common}\n\n"
        f"Recommendations:\n"
        f" • {recommend}\n"
        f" • Consider expanding dataset for better model training\n"
        f" • Implement real-time sentiment monitoring for continuous insights\n"
    )

    print(report)
    return report


# --- Example quick-run when executed as script --- #
if _name_ == "_main_":
    # quick demo to mimic the JS onload behavior:
    load_sample_data()
    update_data_stats()
    preprocess_data()
    classify_sentiments()
    update_performance_metrics()
    # show the chart (will pop up a matplotlib window)
    create_sentiment_chart(show=True)
    generate_report()
