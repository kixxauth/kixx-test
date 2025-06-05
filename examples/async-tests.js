import { describe } from 'kixx-test';
import { assert, assertEqual } from 'kixx-assert';


describe('Async Tests Example', ({ it }) => {
    it('can test promises', async () => {
        const promise = Promise.resolve('promise result');
        const result = await promise;
        assertEqual('promise result', result);
    });

    it('can test promise rejections', async () => {
        try {
            await Promise.reject(new Error('promise error'));
        } catch (error) {
            assertEqual('promise error', error.message);
        }
    });

    it('can test callback-based code', (done) => {
        assert(true);
        setTimeout(done, 10);
    });

    it('can test async operations with custom timeout', async () => {
        function slowOperation() {
            return new Promise((resolve) => {
                setTimeout(resolve, 100);
            });
        }

        await slowOperation();
    }, { timeout: 200 });
});
