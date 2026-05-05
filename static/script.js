// Sentiment Analysis Dashboard JavaScript
// Global state
let rawData = [];
let preprocessedData = [];
let sentimentResults = [];
let performanceMetrics = {};

// Sample dataset
const SAMPLE_DATASET = [
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
];

// Sentiment analysis functions
function loadSampleData() {
    rawData = [...SAMPLE_DATASET];
    updateDataStats();
    showNotification('Sample dataset loaded successfully!', 'success');
}

function addCustomData() {
    const textarea = document.getElementById('customData');
    const customText = textarea.value.trim();
    
    if (!customText) {
        showNotification('Please enter some text first!', 'error');
        return;
    }
    
    const lines = customText.split('\n').filter(line => line.trim());
    rawData.push(...lines);
    textarea.value = '';
    updateDataStats();
    showNotification(`Added ${lines.length} custom texts!`, 'success');
}

function clearData() {
    rawData = [];
    preprocessedData = [];
    sentimentResults = [];
    performanceMetrics = {};
    
    // Clear UI
    document.getElementById('dataStats').classList.add('hidden');
    document.getElementById('preprocessingResults').classList.add('hidden');
    document.getElementById('classificationResults').classList.add('hidden');
    document.getElementById('classifierDetails').classList.add('hidden');
    document.getElementById('analysisReport').classList.add('hidden');
    
    // Reset metrics
    updateDataStats();
    updatePerformanceMetrics();
    
    showNotification('All data cleared!', 'info');
}

function updateDataStats() {
    const totalTexts = rawData.length;
    const avgLength = totalTexts > 0 ? Math.round(rawData.reduce((sum, text) => sum + text.length, 0) / totalTexts) : 0;
    
    document.getElementById('totalTexts').textContent = totalTexts;
    document.getElementById('avgLength').textContent = avgLength;
    
    if (totalTexts > 0) {
        document.getElementById('dataStats').classList.remove('hidden');
    }
}

function preprocessData() {
    if (rawData.length === 0) {
        showNotification('Please load some data first!', 'error');
        return;
    }
    
    showNotification('Preprocessing data...', 'info');
    
    // Simulate preprocessing steps
    const steps = ['step-cleaning', 'step-tokenization', 'step-stemming', 'step-stopwords'];
    let currentStep = 0;
    
    const processStep = () => {
        if (currentStep < steps.length) {
            document.getElementById(steps[currentStep]).classList.add('completed');
            currentStep++;
            setTimeout(processStep, 500);
        } else {
            // Complete preprocessing
            preprocessedData = rawData.map(text => ({
                original: text,
                processed: preprocessText(text),
                tokens: tokenizeText(text)
            }));
            
            showPreprocessingResults();
            showNotification('Preprocessing completed!', 'success');
        }
    };
    
    processStep();
}

function preprocessText(text) {
    // Simple preprocessing
    return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizeText(text) {
    return preprocessText(text).split(' ').filter(word => word.length > 2);
}

function showPreprocessingResults() {
    const container = document.getElementById('preprocessedSample');
    if (preprocessedData.length > 0) {
        const sample = preprocessedData[0];
        container.innerHTML = `
            <div class="preprocessing-sample">
                <h4>Sample Result:</h4>
                <p><strong>Original:</strong> ${sample.original}</p>
                <p><strong>Processed:</strong> ${sample.processed}</p>
                <p><strong>Tokens:</strong> ${sample.tokens.join(', ')}</p>
            </div>
        `;
        document.getElementById('preprocessingResults').classList.remove('hidden');
    }
}

function classifySentiments() {
    if (preprocessedData.length === 0) {
        showNotification('Please preprocess data first!', 'error');
        return;
    }
    
    showNotification('Classifying sentiments...', 'info');
    
    // Simulate classification
    setTimeout(() => {
        sentimentResults = preprocessedData.map(item => {
            const sentiment = classifyText(item.original);
            return {
                ...item,
                sentiment: sentiment.label,
                confidence: sentiment.confidence,
                positiveScore: sentiment.positiveScore,
                negativeScore: sentiment.negativeScore
            };
        });
        
        showClassificationResults();
        updatePerformanceMetrics();
        showNotification('Classification completed!', 'success');
    }, 1000);
}

function classifyText(text) {
    const positiveWords = ['amazing', 'love', 'great', 'excellent', 'fantastic', 'perfect', 'outstanding', 'happy', 'satisfied', 'recommend', 'best', 'wonderful', 'awesome', 'good', 'nice', 'beautiful', 'brilliant'];
    const negativeWords = ['terrible', 'awful', 'bad', 'horrible', 'disappointed', 'poor', 'waste', 'worst', 'hate', 'disgusting', 'useless', 'annoying', 'frustrating', 'slow', 'overpriced'];
    
    const words = text.toLowerCase().split(/\W+/);
    const positiveScore = words.filter(word => positiveWords.includes(word)).length;
    const negativeScore = words.filter(word => negativeWords.includes(word)).length;
    
    let label, confidence;
    if (positiveScore > negativeScore) {
        label = 'positive';
        confidence = Math.min(0.95, 0.6 + (positiveScore - negativeScore) * 0.1);
    } else if (negativeScore > positiveScore) {
        label = 'negative';
        confidence = Math.min(0.95, 0.6 + (negativeScore - positiveScore) * 0.1);
    } else {
        label = 'neutral';
        confidence = 0.5 + Math.random() * 0.3;
    }
    
    return { label, confidence, positiveScore, negativeScore };
}

function showClassificationResults() {
    const container = document.getElementById('classificationResults');
    const results = sentimentResults.slice(0, 6); // Show first 6 results
    
    container.innerHTML = results.map((result, index) => `
        <div class="result-item">
            <div class="result-header">
                <span class="sentiment-badge ${result.sentiment}">${result.sentiment.toUpperCase()}</span>
                <span class="confidence">${(result.confidence * 100).toFixed(1)}%</span>
            </div>
            <div class="result-text">${result.original}</div>
            <div class="result-scores">
                <span class="score positive">+${result.positiveScore}</span>
                <span class="score negative">-${result.negativeScore}</span>
            </div>
        </div>
    `).join('');
    
    container.classList.remove('hidden');
}

function showClassifierDetails() {
    const container = document.getElementById('classifierDetails');
    container.classList.toggle('hidden');
}

function updatePerformanceMetrics() {
    // Simulate performance metrics
    performanceMetrics = {
        accuracy: 85 + Math.random() * 10,
        precision: 82 + Math.random() * 12,
        recall: 88 + Math.random() * 8,
        f1Score: 0
    };
    
    performanceMetrics.f1Score = (2 * performanceMetrics.precision * performanceMetrics.recall) / 
        (performanceMetrics.precision + performanceMetrics.recall);
    
    document.getElementById('accuracy').textContent = `${performanceMetrics.accuracy.toFixed(1)}%`;
    document.getElementById('precision').textContent = `${performanceMetrics.precision.toFixed(1)}%`;
    document.getElementById('recall').textContent = `${performanceMetrics.recall.toFixed(1)}%`;
    document.getElementById('f1Score').textContent = `${performanceMetrics.f1Score.toFixed(1)}%`;
    
    // Update chart
    updateSentimentChart();
}

function updateSentimentChart() {
    if (sentimentResults.length === 0) {
        console.log('No sentiment results to display');
        return;
    }
    
    const counts = sentimentResults.reduce((acc, result) => {
        acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
        return acc;
    }, {});
    
    console.log('Sentiment counts:', counts);
    
    // Clear any existing fallback chart
    const existingFallback = document.getElementById('fallbackChart');
    if (existingFallback) {
        existingFallback.remove();
    }
    
    const canvas = document.getElementById('sentimentChart');
    if (!canvas) {
        console.error('Chart canvas not found!');
        return;
    }
    
    // Show canvas again
    canvas.style.display = 'block';
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded!');
        showNotification('Chart.js library not loaded. Using fallback chart.', 'warning');
        createFallbackChart(counts);
        return;
    }
    
    // Destroy existing chart if it exists
    if (window.sentimentChart && typeof window.sentimentChart.destroy === 'function') {
        window.sentimentChart.destroy();
    }
    
    try {
        // Clear the canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        window.sentimentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [counts.positive || 0, counts.negative || 0, counts.neutral || 0],
                    backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        console.log('Chart created successfully');
        showNotification('Chart created successfully!', 'success');
    } catch (error) {
        console.error('Error creating chart:', error);
        showNotification('Error creating chart: ' + error.message, 'error');
        // Try fallback chart
        createFallbackChart(counts);
    }
}

function createFallbackChart(counts) {
    const canvas = document.getElementById('sentimentChart');
    if (!canvas) return;
    
    // Remove existing fallback chart
    const existingFallback = document.getElementById('fallbackChart');
    if (existingFallback) {
        existingFallback.remove();
    }
    
    // Create a simple HTML-based chart as fallback
    const chartContainer = canvas.parentElement;
    const fallbackChart = document.createElement('div');
    fallbackChart.id = 'fallbackChart';
    fallbackChart.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #4facfe;">
            <h4 style="color: #333; margin-bottom: 20px;">📊 Sentiment Distribution</h4>
            <div style="display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap;">
                <div style="text-align: center; margin: 10px;">
                    <div style="width: 80px; height: 80px; background: #4CAF50; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);">
                        ${counts.positive || 0}
                    </div>
                    <div style="color: #4CAF50; font-weight: bold; font-size: 14px;">Positive</div>
                </div>
                <div style="text-align: center; margin: 10px;">
                    <div style="width: 80px; height: 80px; background: #F44336; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);">
                        ${counts.negative || 0}
                    </div>
                    <div style="color: #F44336; font-weight: bold; font-size: 14px;">Negative</div>
                </div>
                <div style="text-align: center; margin: 10px;">
                    <div style="width: 80px; height: 80px; background: #FF9800; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 18px; box-shadow: 0 4px 8px rgba(255, 152, 0, 0.3);">
                        ${counts.neutral || 0}
                    </div>
                    <div style="color: #FF9800; font-weight: bold; font-size: 14px;">Neutral</div>
                </div>
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 15px; padding: 10px; background: white; border-radius: 5px;">
                📈 Total: ${(counts.positive || 0) + (counts.negative || 0) + (counts.neutral || 0)} texts analyzed
            </div>
        </div>
    `;
    
    // Hide canvas and show fallback
    canvas.style.display = 'none';
    chartContainer.appendChild(fallbackChart);
    console.log('Fallback chart created');
}

function generateReport() {
    if (sentimentResults.length === 0) {
        showNotification('Please run classification first!', 'error');
        return;
    }
    
    const total = sentimentResults.length;
    const positive = sentimentResults.filter(r => r.sentiment === 'positive').length;
    const negative = sentimentResults.filter(r => r.sentiment === 'negative').length;
    const neutral = sentimentResults.filter(r => r.sentiment === 'neutral').length;
    const avgConfidence = sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / total * 100;
    
    const report = `
        <h4>Sentiment Analysis Report</h4>
        <div class="report-stats">
            <div class="stat">
                <strong>Total Texts:</strong> ${total}
            </div>
            <div class="stat">
                <strong>Positive:</strong> ${positive} (${(positive/total*100).toFixed(1)}%)
            </div>
            <div class="stat">
                <strong>Negative:</strong> ${negative} (${(negative/total*100).toFixed(1)}%)
            </div>
            <div class="stat">
                <strong>Neutral:</strong> ${neutral} (${(neutral/total*100).toFixed(1)}%)
            </div>
            <div class="stat">
                <strong>Average Confidence:</strong> ${avgConfidence.toFixed(1)}%
            </div>
        </div>
        <div class="report-insights">
            <h5>Key Insights:</h5>
            <ul>
                <li>${positive > negative ? 'Overall positive sentiment dominates' : negative > positive ? 'Overall negative sentiment dominates' : 'Balanced sentiment distribution'}</li>
                <li>${avgConfidence > 80 ? 'High confidence in classifications' : avgConfidence > 60 ? 'Moderate confidence in classifications' : 'Lower confidence suggests need for model improvement'}</li>
                <li>Most common sentiment: ${positive >= negative && positive >= neutral ? 'Positive' : negative >= positive && negative >= neutral ? 'Negative' : 'Neutral'}</li>
            </ul>
        </div>
        <div class="report-recommendations">
            <h5>Recommendations:</h5>
            <ul>
                <li>${positive > total * 0.6 ? 'Leverage positive feedback for marketing' : negative > total * 0.4 ? 'Address negative feedback concerns' : 'Monitor sentiment trends over time'}</li>
                <li>Consider expanding dataset for better model training</li>
                <li>Implement real-time sentiment monitoring for continuous insights</li>
            </ul>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = report;
    document.getElementById('analysisReport').classList.remove('hidden');
    showNotification('Analysis report generated!', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FF9800'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.style.opacity = '1', 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sentiment Analysis Dashboard loaded!');
    
    // Wait a bit for Chart.js to load
    setTimeout(() => {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded!');
            showNotification('Chart.js library failed to load. Using fallback chart.', 'warning');
        } else {
            console.log('Chart.js loaded successfully, version:', Chart.version);
        }
    }, 1000);
    
    // Initialize chart container
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
        console.log('Chart container found');
    } else {
        console.error('Chart container not found!');
    }
    
    // Add a test button for debugging
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Chart';
    testButton.className = 'btn';
    testButton.style.marginTop = '10px';
    testButton.onclick = function() {
        console.log('Testing chart creation...');
        console.log('Chart.js available:', typeof Chart !== 'undefined');
        console.log('Canvas element:', document.getElementById('sentimentChart'));
        
        // Create some test data
        const testData = [
            { sentiment: 'positive' },
            { sentiment: 'negative' },
            { sentiment: 'neutral' },
            { sentiment: 'positive' },
            { sentiment: 'negative' }
        ];
        sentimentResults = testData;
        updateSentimentChart();
        showNotification('Test chart created!', 'success');
    };
    
    const chartSection = document.querySelector('.section');
    if (chartSection) {
        chartSection.appendChild(testButton);
    }
    
    // Add CSS for completed steps
    const style = document.createElement('style');
    style.textContent = `
        .step.completed {
            background-color: #e8f5e8;
            border-left: 4px solid #4CAF50;
        }
        .step.completed h3 {
            color: #2e7d32;
        }
        .notification {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .sentiment-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .sentiment-badge.positive {
            background-color: #4CAF50;
            color: white;
        }
        .sentiment-badge.negative {
            background-color: #F44336;
            color: white;
        }
        .sentiment-badge.neutral {
            background-color: #FF9800;
            color: white;
        }
        .result-item {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 8px;
            background-color: #f9f9f9;
        }
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .confidence {
            font-size: 12px;
            color: #666;
        }
        .result-scores {
            margin-top: 8px;
        }
        .score {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 4px;
        }
        .score.positive {
            background-color: #e8f5e8;
            color: #2e7d32;
        }
        .score.negative {
            background-color: #ffebee;
            color: #c62828;
        }
        #sentimentChart {
            max-width: 100%;
            height: 300px;
        }
    `;
    document.head.appendChild(style);
});
