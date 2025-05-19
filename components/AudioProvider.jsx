'use client'

import { createContext, useContext, useMemo, useReducer, useRef, useEffect, useState } from 'react'

const ActionKind = {
  SET_META: 'SET_META',
  PLAY: 'PLAY',
  PAUSE: 'PAUSE',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  SET_CURRENT_TIME: 'SET_CURRENT_TIME',
  SET_DURATION: 'SET_DURATION',
}

const AudioPlayerContext = createContext(null)

function audioReducer(state, action) {
  switch (action.type) {
    case ActionKind.SET_META:
      return { ...state, episode: action.payload }
    case ActionKind.PLAY:
      return { ...state, playing: true }
    case ActionKind.PAUSE:
      return { ...state, playing: false }
    case ActionKind.TOGGLE_MUTE:
      return { ...state, muted: !state.muted }
    case ActionKind.SET_CURRENT_TIME:
      return { ...state, currentTime: action.payload }
    case ActionKind.SET_DURATION:
      return { ...state, duration: action.payload }
  }
}

export function AudioProvider({ children }) {
  // Add a client-only state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  let [state, dispatch] = useReducer(audioReducer, {
    playing: false,
    muted: false,
    duration: 0,
    currentTime: 0,
    episode: null,
  })
  let playerRef = useRef(null)

  let actions = useMemo(() => {
    return {
      play(episode) {
        if (episode) {
          dispatch({ type: ActionKind.SET_META, payload: episode })

          // Get the audio source based on the structure of the episode object
          const getAudioSrc = (ep) => {
            // Handle case where audio is an array of objects with file_url
            if (ep.audio && Array.isArray(ep.audio) && ep.audio.length > 0) {
              return ep.audio[0].file_url
            }
            // Handle case where audio is an object with src property
            else if (ep.audio && ep.audio.src) {
              return ep.audio.src
            }
            return null
          }

          const audioSrc = getAudioSrc(episode)
          
          if (playerRef.current && audioSrc && playerRef.current.currentSrc !== audioSrc) {
            let playbackRate = playerRef.current.playbackRate
            playerRef.current.src = audioSrc
            playerRef.current.load()
            playerRef.current.pause()
            playerRef.current.playbackRate = playbackRate
            playerRef.current.currentTime = 0
          }
        }

        playerRef.current?.play()
      },
      pause() {
        playerRef.current?.pause()
      },
      toggle(episode) {
        this.isPlaying(episode) ? actions.pause() : actions.play(episode)
      },
      seekBy(amount) {
        if (playerRef.current) {
          playerRef.current.currentTime += amount
        }
      },
      seek(time) {
        if (playerRef.current) {
          playerRef.current.currentTime = time
        }
      },
      playbackRate(rate) {
        if (playerRef.current) {
          playerRef.current.playbackRate = rate
        }
      },
      toggleMute() {
        dispatch({ type: ActionKind.TOGGLE_MUTE })
      },
      isPlaying(episode) {
        // Get the audio source based on the structure of the episode object
        const getAudioSrc = (ep) => {
          // Handle case where audio is an array of objects with file_url
          if (ep && ep.audio && Array.isArray(ep.audio) && ep.audio.length > 0) {
            return ep.audio[0].file_url
          }
          // Handle case where audio is an object with src property
          else if (ep && ep.audio && ep.audio.src) {
            return ep.audio.src
          }
          return null
        }

        const audioSrc = episode ? getAudioSrc(episode) : null
        
        return episode
          ? state.playing && audioSrc && playerRef.current?.currentSrc === audioSrc
          : state.playing
      },
    }
  }, [state.playing])

  let api = useMemo(() => ({ ...state, ...actions }), [state, actions])

  return (
    <>
      <AudioPlayerContext.Provider value={api}>
        {children}
      </AudioPlayerContext.Provider>
      {isClient && (
        <audio
          ref={playerRef}
          onPlay={() => dispatch({ type: ActionKind.PLAY })}
          onPause={() => dispatch({ type: ActionKind.PAUSE })}
          onTimeUpdate={(event) => {
            dispatch({
              type: ActionKind.SET_CURRENT_TIME,
              payload: Math.floor(event.currentTarget.currentTime),
            })
          }}
          onDurationChange={(event) => {
            dispatch({
              type: ActionKind.SET_DURATION,
              payload: Math.floor(event.currentTarget.duration),
            })
          }}
          muted={state.muted}
        />
      )}
    </>
  )
}

export function useAudioPlayer(episode) {
  let player = useContext(AudioPlayerContext)

  return useMemo(
    () => ({
      ...player,
      play() {
        player.play(episode)
      },
      toggle() {
        player.toggle(episode)
      },
      get playing() {
        return player.isPlaying(episode)
      },
    }),
    [player, episode],
  )
}
