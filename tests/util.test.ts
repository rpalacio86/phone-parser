import Util from '../src/util';

describe('Util', () => {
  describe('findPhoneLists', () => {
    it('should list all files with the given extension', async () => {
      const extension = '.txt';
      const expected = [
        `${__dirname}/subfolder/test-file.txt`,
        `${__dirname}/subfolder/subsubfolder/test-file-2.txt`,
        `${__dirname}/subfolder/subsubfolder/subsubsub/test-file-3.txt`,
      ];
      const listOfTxtFiles = await Util.findPhoneLists(__dirname, extension);
      expect(listOfTxtFiles).toEqual(expected);
    });

    it('should extract the phone numbers', () => {
      const text = `123-4567
      123-45-67
      1234567
       If the city code is not specified, it is considered equal to 812, if the country code is not specified, it is considered equal to 7. You need to find all the numbers in all of the files. Change formatting to the unified "full" format
      +7 (812) 123-4567`;
      const expected = ['123-4567', '123-45-67', '1234567', '+7 (812) 123-4567'];
      const result = Util.extractPhoneNumbersFromText(text);

      expect(result).toEqual(expected);
    });

    it('should parse the extracted number into an integer', () => {
      expect(Util.parsePhoneNumber('123-4567')).toBe(71821234567);
      expect(Util.parsePhoneNumber('456123-4567')).toBe(74561234567);
      expect(Util.parsePhoneNumber('056123-4567')).toBe(70561234567);
      expect(Util.parsePhoneNumber('056-123-4567')).toBe(70561234567);
      expect(Util.parsePhoneNumber('+35 456123-4567')).toBe(354561234567);
    });

    it('Test the rigth supported formats', () => {
      expect(Util.matchPhoneNumber('123-4567')).toBeTruthy();
      expect(Util.matchPhoneNumber('1234567')).toBeTruthy();
      expect(Util.matchPhoneNumber('123-45-67')).toBeTruthy();
      expect(Util.matchPhoneNumber('+7 (812) 123-4567')).toBeTruthy();
      expect(Util.matchPhoneNumber('+7 812 123-4567')).toBeTruthy();
      expect(Util.matchPhoneNumber('+7 (495) 123-45-67')).toBeTruthy();
      expect(Util.matchPhoneNumber('+7812123-45-67')).toBeTruthy();
      expect(Util.matchPhoneNumber('+7812 1234567')).toBeTruthy();
      expect(Util.matchPhoneNumber('(812) 123-45-67')).toBeTruthy();
      expect(Util.matchPhoneNumber('812123-4567')).toBeTruthy();
      expect(Util.matchPhoneNumber('812 1234567')).toBeTruthy();
      expect(Util.matchPhoneNumber('095-123-45-67')).toBeTruthy();
      expect(Util.matchPhoneNumber('095-12-3-45-67')).toBeFalsy();
      expect(Util.matchPhoneNumber('+7 4-95123-45-67')).toBeFalsy();
    });

    it('Should format the phone number in the unified format', () => {
      expect(Util.formatNumber(653451234567)).toBe('+65 (345) 123-4567');
      expect(Util.formatNumber(70451234567)).toBe('+7 (045) 123-4567');
    });
  });
});
