import Util from './util';

export default class App {
  rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  async run() {
    Util.validatePath(this.rootPath);
    const foundNumbers = await Util.extractPhoneNumbersFromFiles(this.rootPath);
    // Remove duplicates
    const phoneNumbers = Array.from(new Set(foundNumbers));
    // Sort numbers in ascending order
    phoneNumbers.sort((a, b) => a - b);

    // Log the number in the unified format
    phoneNumbers.forEach((phoneNumber) => {
      console.log(Util.formatNumber(phoneNumber));
    });
  }
}
