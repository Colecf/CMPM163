# CMPM163 - Final Group Project

[Demo Video](https://youtu.be/pzBnruMG-go)  
[Link to live copy](https://colecf.github.io/CMPM163/final_project)  
[Report](https://github.com/Colecf/CMPM163/blob/master/final_project/report.pdf)  
[Week 10 Presentation](https://github.com/Colecf/CMPM163/blob/master/final_project/powerpoint.pptx)

## Talon Baker:
* Created and added Pixelation post-processing effect.
* Found and placed the desk, lamp, computer, and room wall objects from Google Poly (References to objects can be found in out SIGGRAPH Team Documentation).
* helped with creating a render-to-texture for the computer screen within the scene to display the scene itself.
* I wanted to make it clear how much Cole helped me on this project.
I tried to implemented the render-to-texture but it was laggy and didn’t update based on camera movement. Cole helped fix the lag problem and added the screen updating with the camera.
Cole also fixed various other lag problems and helped build the code so it was easy for us (with lesser knowledge of three.js and shaders) to add and updated our own code.
I think everything came together in the end very well. I’m proud of our accomplishments on this project.

## Cole Faust:
* Created glow effect
* Created bezier surface distortion effect
* Helped with computer screen contents (made the prior frame display on the computer screen, and put RGB shift effect on the screen)
* Created boilerplate code / framework to add effects on

## Andy Long:
* Created the RGB shift (Old/Bad TV) effect

## Kirby Choy:
* Did not contribute to this team project

## Scene Instructions:
* Use the THREE.js OrbitControls to move the camera around the scene (ie. Left mouse click for camera view control, mouse scroll to zoom camera in and out).
* The first thing you will see is the Renter-to-texture scene with different lights, baclground colors and with no alien.
* Back the camera up to see more (mouse scroll).
* Use the Dat.Gui drop down menu to change the post-processing effects.
