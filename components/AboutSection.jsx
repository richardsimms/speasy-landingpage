'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase'
import { TinyWaveFormIcon } from '@/components/TinyWaveFormIcon'

export function AboutSection(props) {
  let [isExpanded, setIsExpanded] = useState(false)
  const [categoryNames, setCategoryNames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const supabase = createClient()
      // Get session for user id
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) {
        setLoading(false)
        return
      }
      // Get user subscriptions
      const { data: subs } = await supabase
        .from('user_category_subscriptions')
        .select('category_id')
        .eq('user_id', userId)
      if (!subs || subs.length === 0) {
        setCategoryNames([])
        setLoading(false)
        return
      }
      const categoryIds = subs.map(s => s.category_id)
      // Get all categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
      if (!categories) {
        setCategoryNames([])
        setLoading(false)
        return
      }
      // Map ids to names
      const names = categories
        .filter(cat => categoryIds.includes(cat.id))
        .map(cat => cat.name)
      setCategoryNames(names)
      setLoading(false)
    }
    fetchCategories()
  }, [])

  return (
    <section {...props}>
      <h2 className="flex items-center font-mono text-sm font-medium leading-7 text-foreground">
        <TinyWaveFormIcon
          colors={['fill-primary/30', 'fill-primary/60']}
          className="h-2.5 w-2.5"
        />
        <span className="ml-2.5">About</span>
      </h2>
      <p
        className={clsx(
          'mt-2 text-base leading-7 text-muted-foreground',
          !isExpanded && 'lg:line-clamp-4',
        )}
      >
        {loading ? (
          'Loading your categories...'
        ) : categoryNames.length > 0 ? (
          <>
            You're subscribed to <span className="font-semibold text-foreground">{categoryNames.join(', ')}</span> newsletters. But you never read them. Time is short, attention is split, and that "save to read later" list only gets longer.{' '}
            <Link href="/settings/preferences" className="underline text-primary hover:text-primary/80 ml-1">Manage preferences</Link>.
          </>
        ) : (
          <>
            You're not subscribed to any categories yet.{' '}
            <Link href="/settings/preferences" className="underline text-primary hover:text-primary/80 ml-1">Choose your interests</Link>.
          </>
        )}
      </p>
      {!isExpanded && (
        <button
          type="button"
          className="mt-2 hidden text-sm font-bold leading-6 text-primary hover:text-primary/80 active:text-primary/70 lg:inline-block"
          onClick={() => setIsExpanded(true)}
        >
          Show more
        </button>
      )}
    </section>
  )
}
