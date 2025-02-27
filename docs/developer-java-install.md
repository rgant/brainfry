# Java Runtime for Firebase Emulators

`firebase-tools` emulators use Java. Not sure what happens if you don't have Java
installed already when you initalize the emulators: `firebase init emulators`.

## Figure out what version of Java you have installed

```sh
java -XshowSettings:properties -version
```

Which outputs something like:

```text
Property settings:
    file.encoding = UTF-8
    file.separator = /
    ftp.nonProxyHosts = local|*.local|169.254/16|*.169.254/16
    http.nonProxyHosts = local|*.local|169.254/16|*.169.254/16
    java.class.path =
    java.class.version = 67.0
    java.home = /Library/Java/JavaVirtualMachines/jdk-23.jdk/Contents/Home
    java.io.tmpdir = /var/folders/0z/3f6c6fvd75b9t93szh2_jjs00000gn/T/
    java.library.path = /Users/rgant/Library/Java/Extensions
        /Library/Java/Extensions
        /Network/Library/Java/Extensions
        /System/Library/Java/Extensions
        /usr/lib/java
        .
    java.runtime.name = Java(TM) SE Runtime Environment
    java.runtime.version = 23.0.2+7-58
    java.specification.name = Java Platform API Specification
    java.specification.vendor = Oracle Corporation
    java.specification.version = 23
    java.vendor = Oracle Corporation
    java.vendor.url = https://java.oracle.com/
    java.vendor.url.bug = https://bugreport.java.com/bugreport/
    java.version = 23.0.2
    java.version.date = 2025-01-21
    java.vm.compressedOopsMode = Zero based
    java.vm.info = mixed mode, sharing
    java.vm.name = Java HotSpot(TM) 64-Bit Server VM
    java.vm.specification.name = Java Virtual Machine Specification
    java.vm.specification.vendor = Oracle Corporation
    java.vm.specification.version = 23
    java.vm.vendor = Oracle Corporation
    java.vm.version = 23.0.2+7-58
    jdk.debug = release
    line.separator = \n
    native.encoding = UTF-8
    os.arch = aarch64
    os.name = Mac OS X
    os.version = 15.3
    path.separator = :
    socksNonProxyHosts = local|*.local|169.254/16|*.169.254/16
    stderr.encoding = UTF-8
    stdout.encoding = UTF-8
    sun.arch.data.model = 64
    sun.boot.library.path = /Library/Java/JavaVirtualMachines/jdk-23.jdk/Contents/Home/lib
    sun.cpu.endian = little
    sun.io.unicode.encoding = UnicodeBig
    sun.java.launcher = SUN_STANDARD
    sun.jnu.encoding = UTF-8
    sun.management.compiler = HotSpot 64-Bit Tiered Compilers
    user.country = US
    user.dir = /Users/rgant/Programming/brainfry
    user.home = /Users/rgant
    user.language = en
    user.name = rgant

java version "23.0.2" 2025-01-21
Java(TM) SE Runtime Environment (build 23.0.2+7-58)
Java HotSpot(TM) 64-Bit Server VM (build 23.0.2+7-58, mixed mode, sharing)
```

## Installing Java

There are many different suppliers of Java, but for whatever reason my system had
Oracle Java installed (probably due to a past job and project). So I decided to
just install [Oracle](https://www.oracle.com/java/technologies/downloads/) again.

## Slow Emulator Tests

I have setup Jasmine to [timeout](/karma.conf.js#L17) a test case after 250ms, but
the Firestore and Storage emulators are quite slow and that frequently results in
random test failures (esp. when running `npm run test:once`). When running using
Java 17 tests would frequently take 1.5 seconds to complete. Since updating to
Java 23 that has been reduced to .5 seconds, but that is still quite slow. So I
added `SLOW_TEST_TIMEOUT` to those tests that talk to the actual emulator.

Doesn't impact the test timeouts, but online indicated that `--ui` flag for the
emulator can cause slowness. So I removed it from `npm run test:once` where I don't
see much need for it, but it is useful for running tests in watch mode.
