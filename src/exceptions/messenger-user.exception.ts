export class MessengerUserNotFound extends Error {
  code = 20;
  constructor() {
    super();
    this.message = "messenger user not found";
    this.name = "MessengerUserNotFound";
  }
}

export class DuplicateMessengerUser extends Error {
  code = 21;
  constructor() {
    super();
    this.message = "duplicate messenger user";
    this.name = "DuplicateMessengerUser";
  }
}

export class MessengerGuestNotFound extends Error {
  code = 25;
  constructor() {
    super();
    this.message = "messenger guest not found";
    this.name = "MessengerGuestNotFound";
  }
}

export class DuplicateMessengerGuest extends Error {
  code = 26;
  constructor() {
    super();
    this.message = "duplicate messenger guest";
    this.name = "DuplicateMessengerGuest";
  }
}
