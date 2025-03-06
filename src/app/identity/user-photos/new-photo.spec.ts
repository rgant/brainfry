import uploadFileJson from '~/../fixtures/assets/istockphoto-825319358-2048x2048.jpg.json';

export const createMockTransfer = (): DataTransfer => {
  const mockTransfer = new DataTransfer();
  // This file has been encoded as base64 string, embedded in a JSON file so that it can be reassembled
  // into a binary Blob for the mock File object. Doing it like this results in much faster run times.
  // https://stackoverflow.com/a/60306604/41908
  const arrayBuffer = Uint8Array.from(atob(uploadFileJson), (c: string): number => c.codePointAt(0) ?? 0);
  const mockFile = new File([ arrayBuffer ], filename, { type: 'image/jpeg' });
  mockTransfer.items.add(mockFile);

  return mockTransfer;
};

export const filename = 'istockphoto-825319358-2048x2048.jpg';
