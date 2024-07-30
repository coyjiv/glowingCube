import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8)
const material = new THREE.MeshBasicMaterial({
  color: 0xfff000, // White color for more noticeable bloom
  wireframe: true,
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  composer.setSize(sizes.width, sizes.height)
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(
  20,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 3

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.dampingFactor = 0.02

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Post-processing
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  1, // Strength of the glow
  0.2, // Radius of the glow
  0.002 // Lower threshold for glow (lower value for more bloom)
)
composer.addPass(bloomPass)

// Animate
const clock = new THREE.Clock()
const rotationSpeed = Math.PI // Speed per second
let phase = 0
let phaseStartTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const delta = elapsedTime - phaseStartTime

  controls.update()

  if (phase === 0) {
    mesh.rotation.x = delta * rotationSpeed
    if (mesh.rotation.x >= Math.PI / 2) {
      mesh.rotation.x = Math.PI / 2
      phase = 1
      phaseStartTime = elapsedTime
    }
  } else if (phase === 1) {
    mesh.rotation.y = delta * rotationSpeed
    if (mesh.rotation.y >= Math.PI) {
      mesh.rotation.y = Math.PI
      phase = 2
      phaseStartTime = elapsedTime
    }
  } else if (phase === 2) {
    mesh.rotation.x = Math.PI / 2 - delta * rotationSpeed
    if (mesh.rotation.x <= 0) {
      mesh.rotation.x = 0
      phase = 3
      phaseStartTime = elapsedTime
    }
  } else if (phase === 3) {
    mesh.rotation.y = Math.PI + delta * rotationSpeed
    if (mesh.rotation.y >= Math.PI * 1.5) {
      mesh.rotation.y = Math.PI * 1.5
      phase = 0
      phaseStartTime = elapsedTime
    }
  }

  composer.render()

  window.requestAnimationFrame(tick)
}

tick()
