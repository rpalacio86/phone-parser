import { accessSync, constants, statSync } from 'fs';
import { files as findFiles, readFilesStream } from 'node-dir';
import { promisify } from 'util';
import { constants as appDefaults } from './constants';

export default class Util {
  /**
   * Regular expression to identify phone numbers in the valid formats
   */
  static readonly PHONE_REGEXP_STR = '(?<=\\D|^)((\\+?\\d+( |-)?)?\\(?\\d{3}\\)?( |-)?)?\\d{3}(-?\\d{4}|-\\d{2}-\\d{2})';

  static readonly AREA_CODE_FORMAT = Intl.NumberFormat('en-US', {
    minimumIntegerDigits: appDefaults.AREA_CODE_LENGTH,
  });

  /**
   * Validates that the rootPath exists and it's accesible. Throws an exception otherwise
   * @param rootPath
   */
  static validatePath(rootPath: string) {
    if (!rootPath) {
      throw new Error('Please provide a path to search for phone lists');
    }
    try {
      accessSync(rootPath, constants.R_OK);
      if (!statSync(rootPath).isDirectory()) {
        throw new Error(`${rootPath} it's not a directory`);
      }
    } catch (err) {
      throw new Error(`No read access to ${rootPath}`);
    }
  }

  /**
   * List all files in rootPath with the extension searching recursively in subdirectories
   * @param rootPath
   * @param extension
   * @returns Absolute path of files found with the provided extension
   */
  static async findPhoneLists(rootPath: string, extension: string): Promise<string[]> {
    const findFilesProm = promisify<string, string[]>(findFiles);
    const files = await findFilesProm(rootPath);
    return files.filter((filepath) => filepath.endsWith(extension));
  }

  /**
   * Test if the tex numbers matchs against the regular expresion
   * @param text
   * @returns
   */
  static matchPhoneNumber(text: string): boolean {
    return new RegExp(this.PHONE_REGEXP_STR).test(text);
  }

  /**
   * Removes the non numeric chars and adds the defaults country and area code if not present
   * @param phoneNumberString the phone as string
   * @returns the phone number as number
   */
  static parsePhoneNumber(phoneNumberString: string): number {
    // Remove non numeric chars
    const extractedNumberString = phoneNumberString.replace(/[^0-9]/g, '');
    const extractedNumberLength = extractedNumberString.length;

    const numberWithAreaCodeLength = appDefaults.AREA_CODE_LENGTH + appDefaults.LOCAL_NUMBER_LENGTH;
    const extractedNumber = Number(extractedNumberString);
    let parsedPhoneNumber = extractedNumber;

    if (extractedNumberLength === appDefaults.LOCAL_NUMBER_LENGTH) {
      const defaultsIncrement = appDefaults.DEFAULT_COUNTRY_CODE
        * 10 ** (numberWithAreaCodeLength)
        + appDefaults.DEFAULT_AREA_CODE * 10 ** appDefaults.LOCAL_NUMBER_LENGTH;
      parsedPhoneNumber = extractedNumber + defaultsIncrement;
    } else if (extractedNumberLength === numberWithAreaCodeLength) {
      const defaultsIncrement = appDefaults.DEFAULT_COUNTRY_CODE
        * 10 ** (numberWithAreaCodeLength);
      parsedPhoneNumber = extractedNumber + defaultsIncrement;
    }

    return parsedPhoneNumber;
  }

  /**
   * Extract all the phone number in the supported formats from the text
   * @param text
   * @returns array of found phone numbers
   */
  static extractPhoneNumbersFromText(text: string): string[] | null {
    const regex = new RegExp(this.PHONE_REGEXP_STR, 'gm');
    return text.match(regex);
  }

  /**
   * Formats the number to match the unified format
   * @param phoneNumber
   * @returns
   */
  static formatNumber(phoneNumber: number): string {
    const phoneNumberStr = String(phoneNumber);
    return `+${phoneNumberStr.slice(0, -10)} (${phoneNumberStr.slice(-10, -7)}) ${phoneNumberStr.slice(-7, -4)}-${phoneNumberStr.slice(-4)}`;
  }

  /**
   * Reads the directory recursively to find .txt files extracting phone numbers
   * @param rootPath
   * @returns
   */
  static async extractPhoneNumbersFromFiles(rootPath: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const phoneNumbers: number [] = [];
      readFilesStream(
        rootPath,
        { match: /.txt$/ },
        (err, stream, next) => {
          if (err) reject(err);
          stream.on('data', (data) => {
            // Extract phone numbers from the part of the file
            const chunkMatches = this.extractPhoneNumbersFromText(data.toString());
            if (chunkMatches) {
              // Add default country and area code if necesary
              const foundNumbers = chunkMatches.map(
                (phoneNumberString) => this.parsePhoneNumber(phoneNumberString),
              );
              phoneNumbers.push(...foundNumbers);
            }
          });
          stream.on('end', () => {
            next();
          });
        },
        (err) => {
          if (err) reject(err);
          resolve(phoneNumbers);
        },
      );
    });
  }
}
