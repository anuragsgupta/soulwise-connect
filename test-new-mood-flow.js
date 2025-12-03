// Test the new 3-step mood check-in flow
const testNewMoodCheckIn = async () => {
  try {
    // Test data matching new 3-step flow structure
    const testData = {
      studentId: "test-student-id", // Replace with actual student ID
      moodLevel: 5,
      moodFactors: {
        "sleep": 4,
        "energy": 5,
        "stress": 2,
        "social": 4,
        "exercise": 3
      },
      journal: "Had a great day today! Felt productive and connected with friends."
    };

    console.log('Testing new mood check-in structure...');
    console.log('Sending data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/mood-checkin/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('\n=== Response ===');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.data) {
      console.log('\n=== Mood Check-In Data ===');
      console.log('ID:', result.data.moodCheckIn.id);
      console.log('Mood Score:', result.data.moodCheckIn.moodScore);
      console.log('Mood Label:', result.data.moodCheckIn.moodLabel);
      console.log('Factors:', JSON.stringify(result.data.moodCheckIn.factors, null, 2));
      console.log('Journal:', result.data.moodCheckIn.notes);
      
      if (result.data.diaryEntry) {
        console.log('\n=== Diary Entry Created ===');
        console.log('ID:', result.data.diaryEntry.id);
        console.log('Title:', result.data.diaryEntry.title);
        console.log('Word Count:', result.data.diaryEntry.wordCount);
      }
    } else {
      console.log('\nError:', result.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
};

testNewMoodCheckIn();
