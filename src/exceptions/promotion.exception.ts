export class PromotionNotFound extends Error {
  code = 1;
  constructor() {
    super();
    this.name = "PromotionNotFound";
    this.message = "promotion not found";
  }
}

export class DuplicatePromotion extends Error {
  code = 2;
  constructor(field: string) {
    super();
    this.name = "DuplicatePromotion";
    this.message = `duplicate promotion ${field}`;
  }
}

export class PromotionTimeRangeNotValid extends Error {
  code = 3;
  constructor(message: string) {
    super(message);
    this.name = "PromotionTimeRangeNotValid";
  }
}

export class SapogoPromotionNotFound extends Error {
  code = 10;
  constructor() {
    super();
    this.name = "SapogoPromotionNotFound";
    this.message = "sapogo promotion not found";
  }
}

export class DuplicateSapogoPromotion extends Error {
  code = 11;
  constructor(field: string) {
    super();
    this.name = "DuplicateSapogoPromotion";
    this.message = `duplicate sapogo promotion ${field}`;
  }
}

export class PointNotEnough extends Error {
  code = 12;
  constructor() {
    super();
    this.message = "point not enough";
    this.name = "PointNotEnough";
  }
}

export class OutOfTurnRedeem extends Error {
  code = 13;
  constructor() {
    super();
    this.message = "out of turn redeem";
    this.name = "OutOfTurnRedeem";
  }
}

export class OutOfStockRedeem extends Error {
  code = 14;
  constructor() {
    super();
    this.message = "out of stock redeem";
    this.name = "OutOfStockRedeem";
  }
}
