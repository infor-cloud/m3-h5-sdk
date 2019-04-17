import { ITranslationItem, ITranslationJob, ITranslationRequest } from './base';
import { FormParser, XmlUtil } from './parser';

/**
 * @hidden
 * @since 2.0.0
 */
export class Translator {
   /**
    * The name of the default language file (MVXCON).
    */
   public static defaultFile = 'MVXCON';

   private static languages = {};

   public translate(request: ITranslationRequest): ITranslationJob {
      const language = request.language;
      const cache = this.getLanguage(language);
      let constants = '';
      const items = request.items;
      for (let i = 0; i < items.length; i++) {
         const item: ITranslationItem = items[i];
         item.text = null;
         if (item.key) {
            item.language = language;
            const key = this.getKey(item);
            const text = cache[key];
            if (text) {
               item.text = text;
            } else {
               // Only add the same constant once to avoid duplicate translation, caching etc for the same request.
               if (!item.file) {
                  item.file = Translator.defaultFile;
               }
               if (constants.indexOf(key) < 0) {
                  constants += key + ',';
               }
            }
         }
      }

      if (constants.length === 0) {
         // All items were already cached so no server request is required
         return null;
      }

      const job: ITranslationJob = {
         items: items,
         constants: constants,
         language: language,
         params: {
            LANC: language,
            CONSTANTS: constants
         },
         commandType: 'FNC',
         commandValue: 'TRANSLATE'
      };

      return job;
   }

   public parseResponse(job: ITranslationJob, content: string) {
      const document = FormParser.parseXml(content);
      const root = FormParser.selectRoot(document);
      if (!root) { return; }

      const nodes = document.getElementsByTagName('Text');
      if (!nodes) { return; }

      for (let i = 0; i < nodes.length; i++) {
         const node = nodes[i];
         const file = XmlUtil.getAttribute(node, 'file');
         const key = XmlUtil.getAttribute(node, 'key');
         const text = node.textContent;
         this.updateItem(job.items, job.language, file, key, text);
      }
   }

   private getKey(item: ITranslationItem): string {
      if (!item.file) {
         item.file = Translator.defaultFile;
      }
      return item.file + ':' + item.key;
   }

   private addToCache(language: string, item: ITranslationItem) {
      const languagCache = this.getLanguage(language);
      languagCache[this.getKey(item)] = item.text;
   }

   private getLanguage(name: string): any {
      let language = Translator.languages[name];
      if (!language) {
         language = {};
         Translator.languages[name] = language;
      }
      return language;
   }

   private updateItem(items: ITranslationItem[], language: string, file: string, key: string, text: string) {
      // Note that there can be more than one item that matches so all items must be checked.
      for (let i = 0; i < items.length; i++) {
         const item = items[i];
         if (key === item.key && file === item.file) {
            item.language = language;
            if (!item.text) {
               item.text = text;
               this.addToCache(language, item);
            }
         }
      }
   }
}
