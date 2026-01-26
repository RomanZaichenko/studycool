
export default interface Map {
  id: number;
  title: string;
  description?: string;
  createdAt: Date;
  lastOpened: Date;
  miniMapIcon?: string;
}