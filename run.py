import os
import sys
import subprocess
import signal
import time
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

def main():
    print("=" * 60)
    print(" 🌊 Starting Ocean Model Backend & Frontend Concurrent Dev Servers")
    print("=" * 60)

    # Use existing sys.executable for backend python runner
    python_executable = sys.executable

    # Prepare commands
    backend_cmd = [
        python_executable, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1",
        "--port", "8000",
        "--reload"
    ]

    # npm command on Windows requires shell=True or npx/npm.cmd execution
    is_windows = os.name == 'nt'
    npm_cmd = "npm.cmd" if is_windows else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]

    processes = []

    try:
        # Start Backend Process
        print("\n🚀 Launching FastAPI Backend (http://127.0.0.1:8000)...")
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=str(BACKEND_DIR)
        )
        processes.append(("Backend", backend_proc))

        # Brief pause to let backend init output print cleanly first
        time.sleep(1)

        # Start Frontend Process
        print("🚀 Launching Vite Frontend (http://127.0.0.1:5173)...")
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=str(FRONTEND_DIR),
            shell=is_windows
        )
        processes.append(("Frontend", frontend_proc))

        print("\n" + "-" * 60)
        print("⚡ Both servers running. Press Ctrl+C to terminate both.")
        print("-" * 60 + "\n")

        # Monitor processes
        while True:
            for name, proc in processes:
                poll = proc.poll()
                if poll is not None:
                    print(f"⚠️  {name} process exited with code {poll}.")
                    raise KeyboardInterrupt
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Shutting down backend and frontend services...")
        for name, proc in processes:
            if proc.poll() is None:
                print(f"  └─ Terminating {name} (PID: {proc.pid})...")
                proc.terminate()
                try:
                    proc.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    proc.kill()
        print("✅ All services stopped safely.")

if __name__ == "__main__":
    main()
