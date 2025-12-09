import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">Setup Successful!</h2>
          <p>Tailwind is working. DaisyUI is working.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Test Button</button>
          </div>
        </div>
      </div>
    </div>
  </StrictMode>,
)