from flask import render_template, Blueprint, request, jsonify, send_from_directory
import os

main = Blueprint('main', __name__)

@main.route('/')
def home():
    # Serve the sentiment analysis dashboard
    dashboard_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'index.html')
    if os.path.exists(dashboard_path):
        with open(dashboard_path, 'r', encoding='utf-8') as f:
            return f.read()
    return render_template('base.html')

@main.route('/style.css')
def serve_style():
    """Serve the dashboard CSS that lives beside index.html"""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..'))
    return send_from_directory(base_dir, 'style.css')

@main.route('/script.js')
def serve_script():
    """Serve the dashboard JS that lives beside index.html"""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..'))
    return send_from_directory(base_dir, 'script.js')

@main.route('/api/sentiment', methods=['POST'])
def analyze_sentiment():
    """API endpoint for sentiment analysis"""
    try:
        data = request.get_json()
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'No texts provided'}), 400
        
        # Import the sentiment analysis functions
        import sys
        sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..'))
        from script import classify_sentiments, preprocess_data, load_sample_data
        
        # Process the texts
        results = []
        for text in texts:
            # Simple sentiment analysis
            sentiment = analyze_text_sentiment(text)
            results.append({
                'text': text,
                'sentiment': sentiment['label'],
                'confidence': sentiment['confidence'],
                'positive_score': sentiment['positive_score'],
                'negative_score': sentiment['negative_score']
            })
        
        return jsonify({'results': results})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def analyze_text_sentiment(text):
    """Simple sentiment analysis function"""
    positive_words = {'amazing', 'love', 'great', 'excellent', 'fantastic', 'perfect', 
                     'outstanding', 'happy', 'satisfied', 'recommend', 'best', 
                     'wonderful', 'awesome', 'good', 'nice', 'beautiful', 'brilliant'}
    
    negative_words = {'terrible', 'awful', 'bad', 'horrible', 'disappointed', 'poor', 
                     'waste', 'worst', 'hate', 'disgusting', 'useless', 'annoying', 
                     'frustrating', 'slow', 'overpriced'}
    
    words = text.lower().split()
    positive_score = sum(1 for word in words if word in positive_words)
    negative_score = sum(1 for word in words if word in negative_words)
    
    if positive_score > negative_score:
        label = 'positive'
        confidence = min(0.95, 0.6 + (positive_score - negative_score) * 0.1)
    elif negative_score > positive_score:
        label = 'negative'
        confidence = min(0.95, 0.6 + (negative_score - positive_score) * 0.1)
    else:
        label = 'neutral'
        confidence = 0.5
    
    return {
        'label': label,
        'confidence': confidence,
        'positive_score': positive_score,
        'negative_score': negative_score
    }

@main.route('/about')
def about():
    return render_template('about.html')  # Ensure you create this template if needed.
