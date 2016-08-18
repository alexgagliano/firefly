from omega import *
from euclid import *
from math import *

cameraPosition = Vector3(0,0,0)
cameraOrientation = Quaternion()
pivotRayOrigin = Vector3(0, 0, 0)
pivotRayDirection = Vector3(0,0,-1)
pivotDistance = 1
pivotDistanceIncrement = 2
    
# node around which the camera rotates.
camera = getDefaultCamera()
camera.setControllerEnabled(False)

startPos = None
rotating = False

# panning speed and vector
panSpeed = 50
panSpeedMultiplier = 1
panVector = Vector3(0,0,0)

def focus():
    global pivotPosition
    global cameraOrientation
    camera.lookAt(pivotPosition, Vector3(0,1,0))
    cameraOrientation = camera.getOrientation()

def onEvent():
    global startPos
    global rotating
    global pivotPosition
    global pivotRayOrigin
    global pivotRayDirection
    global pivotDistance
    global cameraPosition
    global cameraOrientation
    global panVector
    global panSpeed
    
    e = getEvent()
    portholeS = porthole.getService()
    if(e.getType() == EventType.Zoom):
        pivotDistance += e.getExtraDataInt(0) * pivotDistanceIncrement * panSpeedMultiplier
        pivotPosition = pivotRayOrigin + pivotRayDirection * pivotDistance 
        portholeS.broadcastjs('updateCenterOfRotation('+str(pivotPosition[0])+','+str(pivotPosition[1])+','+str(pivotPosition[2])+')','')
        return
    
    if(e.isButtonDown(EventFlags.Left)):
        if(e.isFlagSet(EventFlags.Ctrl)):
            res = getRayFromEvent(e)
            if(res[0] == True):
                pivotRayOrigin = res[1]
                pivotRayDirection = res[2]
                pivotDistance = abs(pivotPosition - pivotRayOrigin)
                pivotPosition = pivotRayOrigin + pivotRayDirection * pivotDistance 
                portholeS.broadcastjs('updateCenterOfRotation('+str(pivotPosition[0])+','+str(pivotPosition[1])+','+str(pivotPosition[2])+')','')
        startPos = e.getPosition()
        rotating = True
        cameraOrientation = camera.getOrientation()
        cameraPosition = camera.getPosition()
        
    elif(e.isButtonUp(EventFlags.Left)):
        rotating = False
        cameraOrientation = camera.getOrientation()
        cameraPosition = camera.getPosition()
        
    elif(rotating == True and e.getServiceType() == ServiceType.Pointer 
        and e.getType() == EventType.Move):
        dx = startPos.x - e.getPosition().x
        dy = startPos.y - e.getPosition().y
        
        # compute the rotation basis and the new rotation
        left = cameraOrientation * Vector3(1,0,0)
        up = cameraOrientation * Vector3(0,1,0)
        rot = Quaternion.new_rotate_axis(radians(dy / 10), left)
        rot = rot * Quaternion.new_rotate_axis(radians(dx / 10), up)
        
        # Rotate the camera around the pivot
        newPosition = rot * (cameraPosition - pivotPosition) + pivotPosition
        camera.setOrientation(rot * cameraOrientation)
        camera.setPosition(newPosition)
        redraw()
        #startPos = e.getPosition()

    # Panning control
    ps = panSpeed
    #print "Source is: ", e.getSourceId()
    #print "Keyboard A : " , int(Keyboard.KEY_A)
    if(e.isKeyDown(Keyboard.KEY_A)): panVector.x -= ps
    elif(e.isKeyUp(Keyboard.KEY_A)): panVector.x = 0
    if(e.isKeyDown(Keyboard.KEY_D)): panVector.x += ps
    elif(e.isKeyUp(Keyboard.KEY_D)): panVector.x = 0
    if(e.isKeyDown(Keyboard.KEY_S)): panVector.z += ps
    elif(e.isKeyUp(Keyboard.KEY_S)): panVector.z = 0
    if(e.isKeyDown(Keyboard.KEY_W)): panVector.z -= ps
    elif(e.isKeyUp(Keyboard.KEY_W)): panVector.z = 0
    if(e.isKeyDown(Keyboard.KEY_R)): panVector.y += ps
    elif(e.isKeyUp(Keyboard.KEY_R)): panVector.y = 0
    if(e.isKeyDown(Keyboard.KEY_F)): panVector.y -= ps
    elif(e.isKeyUp(Keyboard.KEY_F)): panVector.y = 0


def onUpdate(frame, time, dt):
    global pivotPosition
    global cameraPosition
    global cameraOrientation
    global panSpeedMultiplier
    
    if(panVector.magnitude() > 0): 
        redraw()
        cameraPosition += cameraOrientation * panVector * dt * panSpeedMultiplier
        camera.setPosition(cameraPosition)
    #camera.lookAt(pivot.getPosition(), Vector3(0,1,0))
    # cange the pan speed multiplier depending on how far
    # we are from the object, so panning speed looks constant
    l = (cameraPosition - pivotPosition).magnitude()
    panSpeedMultiplier = 0.1 + abs(l / 100)
    
    # update info ui
    #cameraInfo.setText(str(getDefaultCamera().getPosition()))
    #pivotInfo.setText(str(pivotPosition) + ' d=' + str(pivotDistance))

setEventFunction(onEvent)
setUpdateFunction(onUpdate)