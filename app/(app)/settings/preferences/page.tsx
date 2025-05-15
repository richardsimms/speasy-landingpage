"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Category {
  id: string;
  name: string;
}

const contexts = [
  "During my commute",
  "While working out",
  "While doing chores",
  "On a walk",
  "While multitasking",
  "Before bed",
];
const lengths = ["5–10 mins","10–20","20–30","30+","It depends"];
const tones = ["Professional","Friendly","Fast","Calm"];

export default function PreferencesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryPreferences, setCategoryPreferences] = useState<string[]>([]);
  const [currentSubscriptions, setCurrentSubscriptions] = useState<string[]>([]);
  const [otherCategory, setOtherCategory] = useState('');
  const [otherChecked, setOtherChecked] = useState(false);
  const [listeningContext, setListeningContext] = useState('');
  const [sessionLength, setSessionLength] = useState('');
  const [preferredTone, setPreferredTone] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientComponentClient();
    // Fetch categories
    supabase.from("categories").select("id, name").then(({ data }) => {
      if (data) setCategories(data);
    });
    // Fetch current subscriptions
    supabase.from("user_category_subscriptions").select("category_id").then(({ data }) => {
      if (data) {
        const ids = data.map((s: any) => s.category_id);
        setCategoryPreferences(ids);
        setCurrentSubscriptions(ids);
      }
    });
    // Fetch preferences from profiles table
    (async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("listening_context, session_length, preferred_tone, exclusions")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setListeningContext(data.listening_context || '');
        setSessionLength(data.session_length || '');
        setPreferredTone(data.preferred_tone || '');
        setExclusions(data.exclusions || '');
      }
      setLoading(false);
    })();
  }, []);

  const handleCategory = (id: string) => {
    setCategoryPreferences(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClientComponentClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      setLoading(false);
      // Optionally show an error
      return;
    }
    // Add new subscriptions
    for (const id of categoryPreferences) {
      if (!currentSubscriptions.includes(id)) {
        await supabase.from("user_category_subscriptions").insert({
          user_id: userId,
          category_id: id,
        });
      }
    }
    // Remove unselected subscriptions
    for (const id of currentSubscriptions) {
      if (!categoryPreferences.includes(id)) {
        await supabase
          .from("user_category_subscriptions")
          .delete()
          .eq("user_id", userId)
          .eq("category_id", id);
      }
    }
    // Save other preferences to profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        listening_context: listeningContext,
        session_length: sessionLength,
        preferred_tone: preferredTone,
        exclusions,
      })
      .eq("id", userId);
    if (profileError) {
      setLoading(false);
      // Optionally show an error
      return;
    }
    setLoading(false);
    setSaved(true);
    setCurrentSubscriptions(categoryPreferences);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white dark:bg-zinc-900 px-4 py-8">
      <div className="w-full max-w-xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Preferences</h2>
        {/* Category Interests */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Category Interests</label>
          <div className="flex flex-col gap-3 mt-4">
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2 text-lg dark:text-white">
                <input
                  type="checkbox"
                  checked={categoryPreferences.includes(cat.id)}
                  onChange={() => handleCategory(cat.id)}
                  className="w-5 h-5 accent-black dark:accent-white"
                />
                {cat.name}
              </label>
            ))}
            <label className="flex items-center gap-2 text-lg dark:text-white">
              <input
                type="checkbox"
                checked={otherChecked}
                onChange={e => {
                  setOtherChecked(e.target.checked);
                  if (!e.target.checked) setOtherCategory('');
                }}
                className="w-5 h-5 accent-black dark:accent-white"
              />
              Other
            </label>
            {otherChecked && (
              <input
                className="mt-1 p-2 border rounded w-full dark:bg-zinc-800 dark:text-white"
                placeholder="Type your interest"
                value={otherCategory}
                onChange={e => setOtherCategory(e.target.value)}
              />
            )}
          </div>
        </div>
        {/* Listening Context */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Listening Context</label>
          <p className="text-gray-500 dark:text-gray-400 mb-4">When do you usually listen?</p>
          <fieldset>
            <div className="flex flex-col gap-5">
              {contexts.map(opt => (
                <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
                  <input
                    type="radio"
                    name="listening_context"
                    value={opt}
                    checked={listeningContext === opt}
                    onChange={() => setListeningContext(opt)}
                    className="w-5 h-5 accent-black dark:accent-white"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {/* Session Length */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Session Length</label>
          <fieldset>
            <div className="flex flex-col gap-5 mt-4">
              {lengths.map(opt => (
                <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
                  <input
                    type="radio"
                    name="session_length"
                    value={opt}
                    checked={sessionLength === opt}
                    onChange={() => setSessionLength(opt)}
                    className="w-5 h-5 accent-black dark:accent-white"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {/* Tone Preference */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Tone Preference</label>
          <fieldset>
            <div className="flex flex-col gap-5 mt-4">
              {tones.map(opt => (
                <label key={opt} className="flex items-center gap-3 text-lg font-medium dark:text-white">
                  <input
                    type="radio"
                    name="preferred_tone"
                    value={opt}
                    checked={preferredTone === opt}
                    onChange={() => setPreferredTone(opt)}
                    className="w-5 h-5 accent-black dark:accent-white"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        {/* Avoid Topics */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 p-8">
          <label className="font-semibold dark:text-white">Avoid Topics</label>
          <input
            className="mt-2 p-2 border rounded w-full dark:bg-zinc-800 dark:text-white"
            placeholder="e.g. No crypto, Avoid politics"
            value={exclusions}
            onChange={e => setExclusions(e.target.value)}
          />
        </div>
        <button
          className="w-full mt-4 bg-black text-white dark:bg-white dark:text-black font-semibold py-3 rounded-lg disabled:opacity-50"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
        {saved && <div className="text-green-600 dark:text-green-400 text-center mt-2">Preferences updated. Your feed will now reflect your changes.</div>}
      </div>
    </div>
  );
}
