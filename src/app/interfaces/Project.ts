

export default interface Project {
  id: number,
  title: string,
  description?: string,
  createdAt: Date,
  lastOpened: Date,
  iconName?: string
  isCustomIcon?: boolean
  filters?: string[]
  maps?: string[]
}