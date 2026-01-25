export default interface ProjectDto {
  id: number,
  title: string,
  description?: string,
  iconName?: string
  isCustomIcon?: boolean
  filters?: string[]
}