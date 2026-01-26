export default interface ProjectDto {
  title: string,
  description?: string,
  iconName?: string
  isCustomIcon?: boolean
  filters?: string[]
}