"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = [
  "Design & Creativity",
  "Tech & AI",
  "Business & Startups",
  "Personal Growth",
  "Global News",
  "Productivity",
  "Health & Wellness"
];
const contexts = ["Commute","Workout","Chores","Walk","Multitask","Before Bed"];
const lengths = ["5–10 mins","10–20","20–30","30+","It depends"];
const tones = ["Professional","Friendly","Fast","Calm"];

export default function PreferencesPage() {
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);
  const [listeningContext, setListeningContext] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch current preferences
    (async () => {
      setLoading(true);
      const res = await fetch('/api/preferences', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCategoryPreferences(data.categoryPreferences || []);
        setListeningContext(data.listening_context || '');
        setSessionLength(data.session_length || '');
        setPreferredTone(data.preferred_tone || '');
        setExclusions(data.exclusions || '');
      }
      setLoading(false);
    })();
  }, []);

  const handleCategory = (val: string, isOther = false) => {
    if (isOther && val) {
      setCategoryPreferences(prev => prev.includes(val) ? prev : [...prev, val]);
    } else if (val) {
      setCategoryPreferences(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryPreferences,
        listening_context: listeningContext,
        session_length: sessionLength,
        preferred_tone: preferredTone,
        exclusions,
      }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Preferences</h2>
        <div className="flex flex-col gap-6">
          <div>
            <label className="font-semibold">Category Interests</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map(opt => (
                <button key={opt} className={`px-4 py-2 rounded-full border ${categoryPreferences.includes(opt) ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => handleCategory(opt)}>{opt}</button>
              ))}
            </div>
            <input className="mt-2 p-2 border rounded w-full" placeholder="Other (type here)" onBlur={e => handleCategory(e.target.value, true)} />
          </div>
          <div>
            <label className="font-semibold">Preferred Listening Context</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {contexts.map(opt => (
                <button key={opt} className={`px-4 py-2 rounded-full border ${listeningContext === opt ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setListeningContext(opt)}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">Session Length</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {lengths.map(opt => (
                <button key={opt} className={`px-4 py-2 rounded-full border ${sessionLength === opt ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setSessionLength(opt)}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">Tone Preference</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tones.map(opt => (
                <button key={opt} className={`px-4 py-2 rounded-full border ${preferredTone === opt ? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setPreferredTone(opt)}>{opt}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-semibold">Avoid Topics</label>
            <input className="mt-2 p-2 border rounded w-full" placeholder="e.g. No crypto, Avoid politics" value={exclusions} onChange={e => setExclusions(e.target.value)} />
          </div>
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-full mt-4 disabled:opacity-50"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
          {saved && <div className="text-green-600 text-center mt-2">Preferences updated. Your feed will now reflect your changes.</div>}
        </div>
      </div>
    </div>
  );
} 