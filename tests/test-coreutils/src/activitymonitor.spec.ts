// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { expect } from 'chai';

import { Signal } from '@phosphor/signaling';

import { ActivityMonitor } from '@jupyterlab/coreutils';

class TestObject {
  one = new Signal<TestObject, number>(this);

  two = new Signal<TestObject, string[]>(this);
}

describe('@jupyterlab/coreutils', () => {
  describe('ActivityMonitor()', () => {
    let testObj: TestObject;
    let signal: Signal<TestObject, number>;

    beforeEach(() => {
      testObj = new TestObject();
      signal = testObj.one;
    });

    describe('#constructor()', () => {
      it('should accept a signal', () => {
        let monitor = new ActivityMonitor<TestObject, number>({ signal });
        expect(monitor).to.be.an.instanceof(ActivityMonitor);
      });

      it('should accept a timeout', () => {
        let monitor = new ActivityMonitor<TestObject, string[]>({
          signal: testObj.two,
          timeout: 100
        });
        expect(monitor).to.be.an.instanceof(ActivityMonitor);
      });
    });

    describe('#activityStopped', () => {
      it('should be emitted after the signal has fired and a timeout', done => {
        let called = false;
        let monitor = new ActivityMonitor({ signal, timeout: 100 });
        monitor.activityStopped.connect((sender, args) => {
          expect(sender).to.equal(monitor);
          expect(args.sender).to.equal(testObj);
          expect(args.args).to.equal(10);
          called = true;
        });
        signal.emit(10);
        expect(called).to.equal(false);
        setTimeout(() => {
          expect(called).to.equal(true);
          done();
        }, 100);
      });
    });

    describe('#timeout', () => {
      it('should default to `1000`', () => {
        let monitor = new ActivityMonitor<TestObject, number>({ signal });
        expect(monitor.timeout).to.equal(1000);
      });

      it('should be set-able', () => {
        let monitor = new ActivityMonitor<TestObject, number>({ signal });
        monitor.timeout = 200;
        expect(monitor.timeout).to.equal(200);
      });
    });

    describe('#isDisposed', () => {
      it('should test whether the monitor is disposed', () => {
        let monitor = new ActivityMonitor<TestObject, number>({ signal });
        expect(monitor.isDisposed).to.equal(false);
        monitor.dispose();
        expect(monitor.isDisposed).to.equal(true);
      });
    });

    describe('#dispose()', () => {
      it('should dispose of the resources used by the monitor', () => {
        let monitor = new ActivityMonitor<TestObject, number>({ signal });
        monitor.dispose();
        expect(monitor.isDisposed).to.equal(true);
      });

      it('should be a no-op if called more than once', () => {
        let monitor = new ActivityMonitor<TestObject, number>({ signal });
        monitor.dispose();
        monitor.dispose();
        expect(monitor.isDisposed).to.equal(true);
      });
    });
  });
});
