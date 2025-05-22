import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Project {
  id: number
  title: string
  description: string
  image: string
  tech_stack: string
  link: string
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects/')
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="grid gap-4">
        {projects.map(project => (
          <motion.div key={project.id} layout className="p-4 border rounded">
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p>{project.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
