import { useRef } from "react"
import { type Retroarch as RetroarchCore } from "retroarch-core"
import { Emulator } from "../player-screen/emulator"
import { Core } from "@/App"
import { useConnection } from "@/webrtc"

type Props = {
  rom: Uint8Array
  core: Core
}

export const NewPlayerScreen: React.FunctionComponent<Props> = ({
  rom,
  core,
}) => {
  const retroarchRef = useRef<RetroarchCore | null>(null)
  const { peerRef, dataConnectionRef } = useConnection()

  const onStart = () => {
    console.log("EMULATOR STARTED")

    if (!peerRef.current || !dataConnectionRef.current || !retroarchRef.current)
      return

    const viewerPeerId = dataConnectionRef.current.peer

    const canvasEl = retroarchRef.current.module.canvas
    const videoStream = canvasEl.captureStream(60)
    // @ts-ignore
    const audioStream = retroarchRef.current.module.RA.xdest
      .stream as MediaStream
    const stream = new MediaStream()
    videoStream.getTracks().forEach((track) => stream.addTrack(track))
    audioStream.getTracks().forEach((track) => stream.addTrack(track))

    peerRef.current.call(viewerPeerId, stream)
  }

  const coreUrl = `https://cdn.jsdelivr.net/gh/dimitrikarpov/retroarch-peerjs/cores/${core}.js`

  return (
    <div>
      <h1>New Player Screen</h1>
      <Emulator
        retroarchRef={retroarchRef}
        romBinary={rom}
        coreUrl={coreUrl}
        onStart={onStart}
      />
    </div>
  )
}
