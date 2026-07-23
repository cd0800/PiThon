/* global process */
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { spawn } from 'node:child_process'
import net from 'node:net'

const backendPort = 4174

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port })

    socket.once('connect', () => {
      socket.end()
      resolve(true)
    })
    socket.once('error', () => {
      resolve(false)
    })
  })
}

function backendAutoStart() {
  let backendProcess = null

  return {
    name: 'pithon-backend-autostart',
    async configureServer() {
      if (await isPortOpen(backendPort)) {
        return
      }

      backendProcess = spawn(
        process.execPath,
        ['server/server.js'],
        {
          cwd: process.cwd(),
          env: process.env,
          stdio: ['ignore', 'inherit', 'inherit'],
        }
      )

      const stopBackend = () => {
        if (backendProcess && !backendProcess.killed) {
          backendProcess.kill()
        }
      }

      process.once('exit', stopBackend)
      process.once('SIGINT', () => {
        stopBackend()
        process.exit(0)
      })
      process.once('SIGTERM', () => {
        stopBackend()
        process.exit(0)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    backendAutoStart(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:4174',
    },
  },
})
