import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Rect, Transformer } from 'react-konva'

const KonvaTransformer = ({
  isResizing,
  grid,
  listening,
  onChange,
  onClick
}) => {
  const shapeRef = useRef()
  const trRef = useRef()

  const { width, height } = grid

  React.useEffect(() => {
    if (isResizing) {
      trRef.current.nodes([shapeRef.current])
      trRef.current.getLayer().batchDraw()
    }
  }, [isResizing])

  return (
    <React.Fragment>
      <Rect
        {...{ listening }}
        draggable
        ref={shapeRef}
        id="selectRect"
        fill="rgba(0,128,255,0.3)"
        onClick={() => onClick(!isResizing)}
        onTap={() => onClick(!isResizing)}
        onTransform={(e) => {
          e.target.scaleX(Math.round((e.target.scaleX() / width) * width))
          e.target.scaleY(Math.round((e.target.scaleY() / height) * height))
          e.target.position({
            x: Math.round(e.target.x() / width) * width,
            y: Math.round(e.target.y() / height) * height
          })
        }}
        onDragMove={(e) => {
          e.target.position({
            x: Math.round(e.target.x() / width) * width,
            y: Math.round(e.target.y() / height) * height
          })
        }}
        onDragEnd={() => {
          onChange()
        }}
        onTransformEnd={() => {
          const node = shapeRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          onChange()
          console.info(scaleX, scaleY)
        }}
      />
      {isResizing && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < width || newBox.height < height) {
              return oldBox
            }
            return newBox
          }}
        />
      )}
    </React.Fragment>
  )
}

KonvaTransformer.propTypes = {
  grid: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  isResizing: PropTypes.bool,
  listening: PropTypes.bool
}

export default KonvaTransformer
