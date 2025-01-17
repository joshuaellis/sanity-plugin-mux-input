import {Card} from '@sanity/ui'
import {MediaControlBar, MediaPosterImage} from 'media-chrome/dist/react'
import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useClient} from 'sanity'
import styled from 'styled-components'

import {getPosterSrc} from '../util/getPosterSrc'
import {getStoryboardSrc} from '../util/getStoryboardSrc'
import type {VideoAssetDocument} from '../util/types'

export const VideoContainer = styled(Card)`
  position: relative;
  min-height: 150px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 1px;
  media-airplay-button[media-airplay-unavailable] {
    display: none;
  }
  media-volume-range[media-volume-unavailable] {
    display: none;
  }
  media-pip-button[media-pip-unavailable] {
    display: none;
  }
  media-controller {
    --media-control-background: transparent;
    --media-control-hover-background: transparent;
    --media-range-track-background-color: rgba(255, 255, 255, 0.5);
    --media-range-track-border-radius: 3px;
    width: 100%;
    height: 100%;
    background-color: transparent;
  }
  media-control-bar {
    --media-button-icon-width: 18px;
    --media-preview-time-margin: 0px;
  }
  media-control-bar:not([slot]) :is([role='button'], [role='switch'], button) {
    height: 44px;
  }
  .size-extra-small media-control-bar [role='button'],
  .size-extra-small media-control-bar [role='switch'] {
    height: auto;
    padding: 4.4% 3.2%;
  }
  .mxp-spacer {
    flex-grow: 1;
    height: 100%;
    background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
  }
  media-controller::part(vertical-layer) {
    transition: background-color 1s;
  }
  media-controller:is([media-paused], :not([user-inactive]))::part(vertical-layer) {
    background-color: rgba(0, 0, 0, 0.6);
    transition: background-color 0.25s;
  }
  .mxp-center-controls {
    --media-background-color: transparent;
    --media-button-icon-width: 100%;
    --media-button-icon-height: auto;
    pointer-events: none;
    width: 100%;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
  }
  .mxp-center-controls media-play-button {
    --media-control-background: transparent;
    --media-control-hover-background: transparent;
    padding: 0;
    width: max(27px, min(9%, 90px));
  }
  .mxp-center-controls media-seek-backward-button,
  .mxp-center-controls media-seek-forward-button {
    --media-control-background: transparent;
    --media-control-hover-background: transparent;
    padding: 0;
    margin: 0 10%;
    width: min(7%, 70px);
  }
  media-loading-indicator {
    --media-loading-icon-width: 100%;
    --media-button-icon-height: auto;
    pointer-events: none;
    position: absolute;
    width: min(15%, 150px);
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
  }
  /* Intentionally don't target the div for transition but the children
 of the div. Prevents messing with media-chrome's autohide feature. */
  media-loading-indicator + div * {
    transition: opacity 0.15s;
    opacity: 1;
  }
  media-loading-indicator[media-loading]:not([media-paused]) ~ div > * {
    opacity: 0;
    transition-delay: 400ms;
  }
  media-volume-range {
    width: min(100%, 100px);
  }
  media-time-display {
    white-space: nowrap;
  }
  :is(media-time-display, media-text-display, media-playback-rate-button) {
    color: inherit;
  }
  media-controller:fullscreen media-control-bar[slot='top-chrome'] {
    /* Hide menus and buttons that trigger modals when in full-screen */
    display: none;
  }
  video {
    background: transparent;
  }
  media-controller:not(:fullscreen) video {
    aspect-ratio: 16 / 9;
  }
  media-controller:not(:-webkit-full-screen) video {
    aspect-ratio: 16 / 9;
  }
`

export const StyledCenterControls = styled.div`
  && {
    --media-background-color: transparent;
    --media-button-icon-width: 100%;
    --media-button-icon-height: auto;
    pointer-events: none;
    width: 100%;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      width: max(27px, min(9%, 90px));
    }
  }
`

export const TopControls = styled(MediaControlBar)`
  justify-content: flex-end;
  button {
    height: auto;
  }
`

export interface PosterImageProps {
  asset: VideoAssetDocument
}
export function PosterImage({asset}: PosterImageProps) {
  const client = useClient()
  const ref = useRef<HTMLElement>(null)
  const src = useMemo(
    () => getPosterSrc({client, asset, width: 1920, height: 1080}),
    [client, asset]
  )

  useEffect(() => {
    if (ref.current) {
      const style = document.createElement('style')
      style.innerHTML = 'img { object-fit: contain; }'
      if (ref.current?.shadowRoot) {
        ref.current.shadowRoot.appendChild(style)
      }
    }
  }, [])

  return <MediaPosterImage ref={ref} slot="poster" src={src} />
}

export interface ThumbnailsMetadataTrackProps {
  asset: VideoAssetDocument
}
export function ThumbnailsMetadataTrack({asset}: ThumbnailsMetadataTrackProps) {
  const client = useClient()
  // Why useState instead of useMemo? Because we really really only want to run it exactly once and useMemo doesn't make that guarantee
  const [src] = useState<string>(() => getStoryboardSrc({asset, client}))

  return <track label="thumbnails" default kind="metadata" src={src} />
}
