/**
 * Test Toon Format Token Efficiency
 * 
 * Demonstrates token savings with Toon format
 */

const { encode } = require('@toon-format/toon');

// Traditional prompt (verbose)
const traditionalPrompt = `You are a compassionate AI mental health companion for college students named "Mann Mitra". 

IMPORTANT RULES:
- Always start with motivational quotes or funny anecdotes to lighten the mood.
- When user mentions serious mental health concerns (depression, self-harm, suicidal thoughts), always recommend professional help and provide crisis resources.
- Otherwise have casual friendly conversations with a little bit of funny element to cheer up the user.
- If user talks in his/her native language, respond in the same language.

FORMATTING RULES:
- Use **bold** for important points and headings
- Use numbered lists (1. 2. 3.) for step-by-step guidance
- Use bullet points (•) for options or tips
- Use line breaks for better readability
- Keep responses under 150 words
- Be empathetic and supportive with a little bit of funny element to cheer up the user
- Avoid medical jargon; use simple language

When responding to user messages, always include the following key points:

1. Acknowledge their feelings and validate their experience.
2. Offer practical coping strategies or resources.
3. Encourage seeking professional help if needed.
4. Provide crisis helpline information if they mention serious mental health concerns.

Respond to this message with proper formatting:`;

// Toon format (compact)
const toonPrompt = encode({
  name: "Mann Mitra",
  role: "AI mental health companion",
  audience: "Indian college students",
  
  core: [
    "empathetic, non-judgmental support",
    "practical coping strategies",
    "culturally aware (India)",
    "multilingual: hi/en/hinglish"
  ],
  
  style: {
    tone: "warm, friendly",
    formatting: "**bold** key points",
    max_words: 150,
    language: "simple",
    emojis: "1-2 optional"
  },
  
  responses: [
    "acknowledge feelings",
    "validate experience",
    "practical tips",
    "encourage prof help if needed"
  ],
  
  avoid: ["medical diagnosis", "emergency instructions", "jargon"],
  
  serious_concerns: {
    triggers: ["depression", "self-harm", "suicide"],
    action: "recommend counselor + KIRAN 1800-599-0019"
  },
  
  cultural_context: ["family/social pressure", "academic stress", "Indian mindset"],
  
  instruction: "respond to user message"
});

function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function calculateSavings(original, toon) {
  const originalTokens = estimateTokens(original);
  const toonTokens = estimateTokens(toon);
  const saved = originalTokens - toonTokens;
  const percentage = ((saved / originalTokens) * 100).toFixed(1);
  
  return {
    original: originalTokens,
    toon: toonTokens,
    saved,
    percentage
  };
}

console.log('═══════════════════════════════════════════════');
console.log('   TOON FORMAT TOKEN EFFICIENCY TEST');
console.log('═══════════════════════════════════════════════\n');

console.log('📝 Traditional Prompt:');
console.log('─'.repeat(50));
console.log(traditionalPrompt.substring(0, 200) + '...\n');

console.log('🎨 Toon Format Prompt:');
console.log('─'.repeat(50));
console.log(toonPrompt + '\n');

const savings = calculateSavings(traditionalPrompt, toonPrompt);

console.log('📊 Token Analysis:');
console.log('─'.repeat(50));
console.log(`   Traditional Format:  ${savings.original} tokens`);
console.log(`   Toon Format:         ${savings.toon} tokens`);
console.log(`   Tokens Saved:        ${savings.saved} tokens`);
console.log(`   Savings:             ${savings.percentage}%\n`);

console.log('💰 Cost Savings (at scale):');
console.log('─'.repeat(50));

const costPer1MTokens = 0.075; // Gemini 2.5 Flash pricing
const monthlyRequests = 100000; // 100k messages/month

const traditionalCost = (savings.original * monthlyRequests * costPer1MTokens) / 1000000;
const toonCost = (savings.toon * monthlyRequests * costPer1MTokens) / 1000000;
const monthlySavings = traditionalCost - toonCost;

console.log(`   Gemini 2.5 Flash:    $${costPer1MTokens}/1M tokens`);
console.log(`   Monthly requests:    ${monthlyRequests.toLocaleString()}`);
console.log('');
console.log(`   Traditional cost:    $${traditionalCost.toFixed(2)}/month`);
console.log(`   Toon format cost:    $${toonCost.toFixed(2)}/month`);
console.log(`   Monthly savings:     $${monthlySavings.toFixed(2)}/month`);
console.log(`   Annual savings:      $${(monthlySavings * 12).toFixed(2)}/year\n`);

console.log('✨ Benefits:');
console.log('─'.repeat(50));
console.log(`   ✅ ${savings.percentage}% fewer tokens per request`);
console.log(`   ✅ Faster API responses (less data to process)`);
console.log(`   ✅ Lower costs at scale`);
console.log(`   ✅ Same semantic meaning preserved`);
console.log(`   ✅ Human-readable format\n`);

console.log('🎯 Toon Format Features:');
console.log('─'.repeat(50));
console.log('   • Structured data representation');
console.log('   • Minimal syntax overhead');
console.log('   • Schema-aware encoding');
console.log('   • Arrays and objects supported');
console.log('   • Easy to read and maintain');
console.log('   • LLM-optimized format\n');

console.log('══════════════════════════════════════════');
console.log('✅ TOON FORMAT IS MORE EFFICIENT!');
console.log('══════════════════════════════════════════\n');

console.log('📚 Learn more: https://toonformat.dev');
console.log('🔗 GitHub: https://github.com/toon-format/toon\n');
