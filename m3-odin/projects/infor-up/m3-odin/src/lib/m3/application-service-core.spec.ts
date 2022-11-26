import { ApplicationServiceCore, UserServiceCore } from '../m3';
import { IMessage } from '../m3/types';

describe('ApplicationServiceCore', () => {
   let service: ApplicationServiceCore;
   const message: IMessage = {
      m3Command: 'launch',
      m3Parameter: { link: 'foo' },
   };

   beforeEach(() => {
      service = new ApplicationServiceCore();
   });

   it('should return if H5 environment', () => {
      UserServiceCore.isH5Host = true;
      expect(service.isH5()).toBe(true);
   });

   it('should launch m3 app', () => {
      const spySendMessage = spyOn(service as any, 'sendMessage').and.callFake(
         (message) => {
            expect(message).toBe(message);
         }
      );
      service.launch(message.m3Parameter.link);
      expect(spySendMessage).toHaveBeenCalled();
   });

   it('should post message', () => {
      const spyPostMessage = spyOn(parent, 'postMessage').and.callFake(
         (message) => {
            expect(message).toBe(
               '{"m3Command":"launch","m3Parameter":{"link":"foo"}}'
            );
         }
      );
      service['sendMessage'](message);
      expect(spyPostMessage).toHaveBeenCalled();
   });
});
