export class AusCompetitor {
  public number: number;
  public name: string;
  public status: string;
  public silk: string;
  public WIN: number;
  public PLC: number;
  public type: number;

  constructor(
    _number: number,
    _name: string,
    _status: string,
    _silk: string,
    win: number,
    plc: number,
    _type: number
  ) {
    this.number = _number;
    this.name = _name;
    this.status = _status;
    this.WIN = win;
    this.PLC = plc;
    this.silk = _silk;
    this.type = _type;
  }
}
