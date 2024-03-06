import { useEffect, useState } from "react"

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>

const Image: React.FC<ImageProps> = ({ src, ...props }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
  }, [src])

  return (
    <>
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
        </div>
      )}
      <img src={src} {...props} onLoad={() => setLoading(false)} className={loading ? "hidden" : ""} />
    </>
  )
}

export default Image
