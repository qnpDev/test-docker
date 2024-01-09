export class VoucherNotFound extends Error {
  code = 50;
  constructor() {
    super();
    this.message = "voucher not found";
    this.name = "VoucherNotFound";
  }
}
