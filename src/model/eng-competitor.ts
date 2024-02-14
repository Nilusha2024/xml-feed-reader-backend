export class EngCompetitor {
  public number: number;
  public name: string;
  public status: string;
  public silk: string;
  public prices: Array<String>;
  public type: number;

  constructor(
    _number: number,
    _name: string,
    _status: string,
    _silk: string,
    _prices: Array<String>,
    _type: number
  ) {
    this.number = _number;
    this.name = _name;
    this.status = _status;
    this.silk = _silk;
    this.prices = _prices;
    this.type = _type;
  }
}
