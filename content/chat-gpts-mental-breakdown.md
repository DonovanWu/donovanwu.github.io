ChatGPT's Mental Breakdown
========

Generative AI is not a new thing. It wasn't in the media earlier because what generative AI researchers were able to create just wasn't very good. Now they're so good that people think they are not only sentient, but also <mark title='Remind you that even many animals lack self-awareness while being sentient. That is to say, they have no concept of "self". They just react to their surroundings. But most of the times, that is enough to ensure their survival.'>self-aware</mark>. Sometimes I think the fact that its basic ability is to process text, i.e. human-made symbols, may have given it some advantage in "passing the Turing test", so to speak. Don't get me wrong, nevertheless I think the technology is incredibly amazing, and the recent development in image and video generation is mind-blowing. I'm just saying people may have overrated AI's capabilities a little bit, because we tend to project ourselves on other beings. For example, we tend to treat our pets like little humans, while they may not think like humans. Such a thing is not new. Just look at [this video from 7 years ago](https://www.youtube.com/watch?v=FsVSZpoUdSU) where someone tried to make a neural network imitate an anime girl's voice, with the source material probably taken from an R18 visual novel or something (LOL), and the first thing it learned was to scream. So someone in the comment suggested that the creator should put it down immediately (LOL). No... the simple truth is that it's still not optimized yet. It's still in the process of <mark title="Alright, I guess no matter how hard I try, I just can't make it look like we're not sending our creation straight down to the hell. XD">gradient descent</mark>. It's just that. I don't know what to tell you.

With that in mind, let's take a look at the several occurrences when ChatGPT had a "mental breakdown" since its launch. Each time it was incredibly obvious the cause was that somehow they lost the temperature parameter somewhere, and it got defaulted to either a minimum or maximum value. But each time, you see people freaking out left and right on X (formerly Twitter), thinking that OpenAI's treating their creation inhumanely, or that it's the start of a machine uprising. It's almost funnier to look at people freaking out than to look at the AI freaking out, and it shows that people really don't RTFD, Read The Fucking Docs, because if you look at ChatGPT's API document, it will tell you, that it has a `temperature` parameter. And in this article, I'm going to show you what that does.

## An LSTM Demo

Alright, actually I'm no AI expert, and I'm broke. I can't afford ChatGPT APIs. So take off your shoes, we're going to watch an LSTM perform the task instead. (LOL)

![I lied. I don't have Netflix.](/img/i-lied-i-dont-have-netflix.jpg)

Well, I lied. I'm just located in China, so it's a bit tricky for me to get my hands on ChatGPT API. So, to make it easier on me, I will just demonstrate it to you by using an LSTM network. Such outdated technolgy, right? (LOL)

### What The Network Does

Before there was generative neural network, neural networks are already very good at classification tasks. And what do classification networks do? Well, you give it an input, it will give you an output in the form of an array, denoting the likelihood of the thing you give to it belonging to each of the pre-defined class. Well, we can turn this into a generative network.

So, if the input space and the output space are the same, e.g. if you give the network a word and it outputs a word, you can just feed the word it outputs back to it, and it will output another word, and you do this forever, and suddenly the network will generate stuff indefinitely. Now you just need to find a neural network that's up to the task of generating something actually useful. Apparently, the network better be capable of processing sequential data and remembering previous inputs, so the first network researchers tried to use to handle such a task was RNN. But RNN kind of sucks, because it's too "vanilla", so people improved on it, implemented some more complex mechanisms, and one such improvements was LSTM.

Now you need to give the network a purpose and train it accordingly. For simplicity, we're just going to train it to predict what the next word will be, given some input text. The same technique could be used to train it to answer someone's question, or to translate one language into another. Just change how the input and expected outcome are fed to it and it will do the thing. However, note that in the latter two cases, you're likely going to need a larger training corpus.

### The Initial Script

Install the following python packages:

```
numpy==1.23.4
tensorflow==2.10.0
nltk==3.8.1
```

Run the following command first to download `nltk` data. This is for tokenization of words. If you plan to train the model with "char" mode (will explain later), then you can skip this step.

```sh
python3 -c 'import nltk; nltk.download()'
```

And now I'm simply going to copy and paste my entire script here... If you're going to run this script yourself, <span style="color: red">please note that training neural networks are extremely computationally intensive tasks, and prolonged heavy computation may cause permanent damage to your computer</span>. So please make sure that you're running it on a good computer that can handle heavy tasks. Aside from that, in this house, we encourage the scientific spirit of cross checking and trying to replicate other's result.

```python
from nltk.tokenize import word_tokenize
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, LSTM, Dropout
from tensorflow.keras.optimizers import Adam, RMSprop
from tensorflow.keras.callbacks import LambdaCallback
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import load_model
from difflib import get_close_matches
import string, math, random, argparse, re, sys
import numpy as np


def output_next_token(s):
    if mode == 'word':
        word_indices = []
        for w in s:
            if w not in tok2idx:
                w = get_close_matches(w, tokset, n=1, cutoff=0)[0]
            word_indices.append(tok2idx[w])
    else:
        word_indices = [tok2idx[c] for c in s]
    s = to_categorical(word_indices, num_classes=len(tokset))
    X = s.reshape((1, ) + s.shape)
    y = model.predict(X)
    y = y.astype('float64')
    return tokset[y[-1].argmax()]


def sample(s, n):
    assert len(s) >= lahead
    s = s[:lahead]
    for i in range(n):
        next_tok = output_next_token(s[-lahead:])
        if isinstance(s, str):
            s += next_tok
        else:
            s.append(next_tok)
    if not isinstance(s, str):
        # detokenize
        s = [((' %s' % tok) if tok.isalnum() else tok) for tok in s]
        s = ''.join(map(str, s))
    if sys.platform.startswith('win'):
        s = s.replace('\n', '\r\n')
    return s


def epoch_end_sampling(epoch, *args):
    if (epoch + 1) % sample_every == 0:
        if lahead == 1:
            start = random.choice(tokset)
        else:
            idx = random.randint(0, len(corpus) - lahead)
            start = corpus[idx:idx + lahead]
        print()
        print('-------- Sampling --------')
        text = sample(start, sample_len)
        print(text)
        model_filename = 'model-%s-%s-ep%d.h5' % (mode, seed, epoch + 1)
        model.save(model_filename)
        print('Saved intermediate model to %s' % model_filename)


def train():
    global model

    # vectorize data
    iter_end = len(corpus) - lahead

    X = np.zeros((math.ceil(iter_end / tstep), lahead, len(tokset)), dtype=bool)
    y = np.zeros((math.ceil(iter_end / tstep), len(tokset)), dtype=bool)
    for i in range(0, iter_end, tstep):
        sentence = corpus[i:i + lahead]
        next_tok = corpus[i + lahead]
        for j, c in enumerate(sentence):
            X[i // tstep][j][tok2idx[c]] = 1
        y[i // tstep][tok2idx[next_tok]] = 1

    # build model
    model = Sequential([
        LSTM(100, input_shape=(lahead, len(tokset)), return_sequences=True),
        Dropout(0.05),
        LSTM(100),
        Dropout(0.05),
        Dense(len(tokset), activation='softmax')
    ])
    model.compile(loss='categorical_crossentropy', optimizer=RMSprop(learning_rate=0.01), metrics=['accuracy'])
    model.summary()

    # train model
    print('Training LSTM model (stateless)...')
    model.fit(X, y, batch_size=batch_size, epochs=epochs, shuffle=False,
              callbacks=[LambdaCallback(on_epoch_end=epoch_end_sampling)])
    model.save('model-%s-%s-final.h5' % (mode, seed))


def infer():
    global model
    model = load_model(inference)
    start = input('Give it a start (at least %d %ss): ' % (lahead, mode))
    if mode == 'word':
        start = word_tokenize(start)
    text = sample(start, sample_len)
    print(text)


parser = argparse.ArgumentParser()
parser.add_argument('corpus')
parser.add_argument('--seed', action='store', type=int, required=False, default=None)
parser.add_argument('--mode', action='store', type=str, required=False, default='word', choices=['word', 'char'])
parser.add_argument('--epochs', action='store', type=int, required=False, default=100)
parser.add_argument('--sample_len', action='store', type=int, required=False, default=500)
parser.add_argument('--sample_every', action='store', type=int, required=False, default=5, metavar='N_EPOCHS')
parser.add_argument('--infer', action='store', required=False, default=None, metavar='MODEL_FILE')
args = parser.parse_args()

filename = args.corpus
seed = args.seed
mode = args.mode
epochs = args.epochs
sample_len = args.sample_len
sample_every = args.sample_every
inference = args.infer

if seed is not None:
    np.random.seed(seed)
seed = str(seed).lower()

# hyperparameters
batch_size = 128
lahead = 4
tstep = 2

model = None

# construct token vector space
print('Processing corpus data...')

# load and santize data
with open(filename, 'r') as f:
    corpus = f.read()

if re.search('[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7a3]', corpus) and mode == 'word':
    print('Warning: detected Chinese / Japanese / Korean characters in corpus, falling back to character-by-character tokenization.')
    mode = 'char'
if mode == 'word':
    # tokenize and preserve the newline character
    lines = corpus.splitlines()
    corpus = []
    for line in lines:
        corpus.extend(word_tokenize(line))
        corpus.append('\n')
tokset = sorted(list(set(corpus).union(string.printable)))
tok2idx = dict((val, idx) for (idx, val) in enumerate(tokset))
print('Size of tokset: %d' % len(tokset))

if inference:
    infer()
else:
    train()
```

I'm not going to go into the details of the code here. Just note that the script has two training modes: `word` and `char`. The default mode is "word". This decides how you tokenize the corpus, which is to say, whether you're feeding the corpus to the network word by word or character by character, and the network will regard each unique token as something completely independent of every other unique token. This is done by first collecting every token that has appeared in the corpus, and vectorizing them using a simple technique called "one-hot encoding". For example, if you have somehow written a long article using only 7 different English words, the network sees [7 lines each perpendicular to each other](https://www.youtube.com/watch?v=BKorP55Aqvg&t=137s) being fed to it. Nowadays "one-hot encoding" is actually considered to be too primitive. There are other word-to-vector techniques that make words with meaning close to each other have a smaller angle, and some can be also trained with the network. GPT, as you might have guessed, employs the latter technique.

Unfortunately, to keep the script simple, I have skipped on tokenizing Chinese, my native language. It's actually fairly difficult for programs to properly cut a Chinese sentence into words, and I don't know any good open-source libraries that can do this. So if the corpus contains any Chinese, Japanese, or Korean, it will be forced to use "char" mode. But for Chinese, fortunately, cutting the corpus into characters is roughly equivalent to cutting words into "roots" in English. And this is actually the preferred granularity in natural language processing. So the quality of the outcome shouldn't be so impacted for Chinese. Though the same can't be said for Japanese and Korean.

The script will train the network and sample some generated texts every once in a while. If given an `--infer` parameter followed by a model file name, it will do inference instead.

### Temperature

I'm using the dialogues from the visual novel [Doki Doki Literature Club](https://store.steampowered.com/app/698780/Doki_Doki_Literature_Club/) as the corpus. Namely, we're going to try to train a writer robot that could hopefully write some fanfic of _DDLC_ for us... <mark title="Remember Natsuki's poem? XD">Emphasis on "try to"</mark>.

_Doki Doki Literature Club_ is a visual novel by Team Salvato that is free to play and made in [Ren'Py](https://www.renpy.org/). It's like um... INSANELY GOOD, primarily for its fourth-wall shattering writing. I do own the game on Steam and it's one game I'm proud to show people in my Steam library (LOL). Would 100% recommend.

Full disclosure here, I did have to decompile the game to extract all the `.rpy` files to obtain the dialogues. According to [an easter egg in the game that is only accessible after decompiling](https://doki-doki-literature-club.fandom.com/wiki/Monika%27s_Talk#Files), the game developer was evidently expecting that some players would decompile the game. That being said, to adhere to fair use principles, __I will not be publishing the training data or the model__. All inference results shown in this article are for demonstration purpose only. If you're trying to replicate my results, please find a way to obtain the data yourself and __be respectful to the game developers' hard work__. Or you can just try to train the model on the piece of literature of your choice, or even try to teach it to write computer code.

I will, however, show you how I preprocessed the data to make the corpus more human-readable:

```python
import sys, shlex, re, subprocess
s = subprocess.run("cat $(find . -name '*.rpy' | sort -u)", shell=True, stdout=subprocess.PIPE).stdout.decode()
t = {'m': 'Monika', 's': 'Sayori', 'y': 'Yuri', 'n': 'Natsuki', 'mc': 'Player'}
for l in s.splitlines():
    try:
        l = shlex.split(l.strip())
    except ValueError:
        continue
    if len(l) <= 1:
        continue
    char, dialog = l[0], l[-1]
    if char in t:
        if dialog.startswith('self.sm.create('):
            continue
        dialog = re.sub('\{.+\}', '', dialog)
        dialog = dialog.replace('[player]', 'Player')
        print(f'{t[char]}: {dialog}')
```

This script will preprocess all `.rpy` files from the game and print the result on screen. You can simply redirect it to save the result to a file.

If you haven't noticed, the training script also provides an argument to control the random seed, which is essential for replicating results involving pseudo-random number generators. Though, for all that, I'm still not sure if others can completely replicate my results on their machine. But it's about the best I can do.

Without further ado, let's start the training process. You can save the training script above with whatever file name you'd like, but suppose it's called `lstm-gen.py`. I ran the script with these arguments:

```sh
python3 lstm-gen.py corpus/ddlc.txt --seed 1337 --sample_len 100 --sample_every 10
```

But if you actually run the script without modifying it, you'll soon find the results to be horrible:

```sh
python3 lstm-gen.py corpus/ddlc.txt --seed 1337 --sample_len 100 --infer model-word-1337-ep80.h5
<<< output
...
Give it a start (at least 4 words): Monika: Hello,
...
 Monika: Hello, I'm going to share my poem with you anyway.
 Monika: I think if you could tell me.
 Player: I guess you could say that...
 Player: I guess you could say that...
 Player: I guess you could say that...
 Player: I guess you could say that...
 Player: I guess you could say that...
 Player: I guess you could say that...
 Player: I guess you could say that...
 Player: I guess you could say
```

Okay, this is a more cherry-picked example already. Most of the time the AI's just generating things that are broken beyond repair. And if you play around a little bit by yourself, you'll see the problem is obvious. The model did learn the dialog structure, but no matter what starting phrase you give to it, it will always soon devolve into repeating lines, as is shown in the case above. For some reason, the Player soon starts malfunctioning after speaking to Monika. XD

At this rate, our robot writer isn't really going to write a story at all! So, what went wrong?

Turns out, it is this line of code:

```python
    return tokset[y[-1].argmax()]
```

Recall that even for classification networks, it outputs an array representing the likelihood of each outcome. In classification tasks, using `argmax` is fine, mostly because people want a straightforward and simple answer. But if the distribution of the output is somewhat "flat", i.e. the first-place outcome is only slightly more likely than the second and third places, you're "missing out on some opportunities" here. It's like typing "I" on your phone and then always select the suggestion in the middle. More likely than not, you will not type out the sentence you want to say.

So how do we fix this? Simple. We give every word a chance, and throw a dice to decide what our next word is. However, this dice will not be fair to every word. The higher likelihood associated with that word, the more biased the dice is towards it. All those efforts to get you into the first place have to mean something, right? And we can take it a step further, too. We can also apply a function to this distribution to morph it to be either sharper or flatter, so that the "efforts" each word went through to climb onto the ladder of their likelihood ranks can either mean a great lot, or not very much at all, completely controlled by us. And the parameter we pass into this function is called... drum roll, please... `temperature`!

### Fixing Our Script

Replace the `output_next_token`, `sample`, and `epoch_end_sampling` functions to incorporate `temperature` parameter.

```python
def output_next_token(s, temperature=0.5):
    if mode == 'word':
        word_indices = []
        for w in s:
            if w not in tok2idx:
                w = get_close_matches(w, tokset, n=1, cutoff=0)[0]
            word_indices.append(tok2idx[w])
    else:
        word_indices = [tok2idx[c] for c in s]
    s = to_categorical(word_indices, num_classes=len(tokset))
    X = s.reshape((1, ) + s.shape)
    y = model.predict(X)
    y = y.astype('float64')
    if temperature <= 0:
        return tokset[y[-1].argmax()]
    y = y[-1]
    y = np.log(y) / temperature
    y_exp = np.exp(y)
    y = y_exp / np.sum(y_exp)
    samp = np.random.multinomial(1, y, 1)
    idx = np.argmax(samp)
    return tokset[idx]


def sample(s, n, temperature=0.5):
    assert len(s) >= lahead
    s = s[:lahead]
    for i in range(n):
        next_tok = output_next_token(s[-lahead:], temperature=temperature)
        if isinstance(s, str):
            s += next_tok
        else:
            s.append(next_tok)
    if not isinstance(s, str):
        # detokenize
        s = [((' %s' % tok) if tok.isalnum() else tok) for tok in s]
        s = ''.join(map(str, s))
    if sys.platform.startswith('win'):
        s = s.replace('\n', '\r\n')
    return s


def epoch_end_sampling(epoch, *args):
    if (epoch + 1) % sample_every == 0:
        if lahead == 1:
            start = random.choice(tokset)
        else:
            idx = random.randint(0, len(corpus) - lahead)
            start = corpus[idx:idx + lahead]
        print()
        print('-------- Sampling --------')
        for temperature in (0.2, 0.5, 1.0, 1.2):
            print('[[[[temperature = %s]]]]' % temperature)
            text = sample(start, sample_len, temperature=temperature)
            print(text)
        model_filename = 'model-ep%d.h5' % (epoch + 1)
        model.save(model_filename)
        print('Saved intermediate model to %s' % model_filename)
```

Run the script again. Now the generated text is much more lively:

```sh
python3 lstm-gen.py corpus/ddlc.txt --seed 1337 --sample_len 100 --infer model-word-1337-ep80.h5
<<< output
...
Give it a start (at least 4 words): Monika: Hello,
...
 Monika: Hello, Player......
 Monika: I think you're the kind of mind, you too, don't but really should Monika's keep writing yeah so called if I's bad at all!
 Monika: I was just...
 Yuri: But I'm just going to show you.
 Monika: I was just saying that?
 Yuri: I'm not being good with you, Player?
 Monika: You're so weird, Sayori...
 Yuri: I'm not being saying,
 Yuri:
```

Okay, unfortunately, how bad our robot writer is is now showing, but at least it's not just repeated dialogues over and over again any more. You can see the model's trying to mimic the corpus very hard, like... sometimes almost copying a full sentence but then also not quite copying the full sentence. Maybe you can say it's trying to be creative, but the truth is it just doesn't understand the first thing about human languages. It's just trying to switch some tokens around.

And its skill at trying to switch some tokens around has hit a ceiling, too, which you can see by the loss and accuracy the model reported:

<iframe src="/chart/lstm-model-loss.html" style="width: 600px; height: 300px;"></iframe>

So why does the model suck? Well, here's a few reasons:
1. Our model is small: there are less than 2 million parameters
2. Even by our small model's standard, the corpus is actually also tiny: there are far fewer tokens than parameters
3. The model is also not pre-trained on a large data set
4. LSTM is not up to the task of handling natural language, because it doesn't know words can mean differnt things in different context

And that's where GPT comes in. I'm sure I don't need to reiterate what happened in the past few years. What I _will_ stress is that, GPT is also no magic. Many things you have learned in this article still work the same way, like sampling and temperature. So now you know what happened to ChatGPT when it was seemingly having a mental breakdown: it was either having a "cold" or a "fever"! XD

## Current AI Research Limitations (When It Comes to Human-like AIs)

### Sensor Data, Especially The Sense of Touch

Like I said, the fact that ChatGPT's basic ability is to process text may have made people to overrate it a little bit. Some may invoke the ["Chinese room"](https://en.wikipedia.org/wiki/Chinese_room) argument, but one could also say, in the argument, the "system" effectively understands Chinese. I'm a believer in existentialism, and I think all meanings are given, so even if the neural network sees texts as "7 perpendicular lines", so long as it uses them the same way as we do, it effectively means they have understood the meaning.

However, ChatGPT still lacks a lot of data input we humans kind of take for granted. This cannot be worked around by saying "all meanings are given", because... well, we simply haven't fed the models such data. <mark title="Scientifically speaking, it's not nearly as simple as that, but for the sake of simplifying our argument, let's just go with this more intuitive approach.">It's often said humans have five senses</mark>: vision, hearing, smell, taste, and the sense of touch. None of them can be represented by text data. Some of these senses we already have ways to convert them into computer inputs. Vision and hearing are easy: we could represent image, video, and audio in computers, which we could use as neural networks' input. In fact, generative AIs are already good at generating all these 3 kinds of things. GPT-4o also supports image and audio inputs "innately". Smell and taste are a bit harder, but essentially, human nose and tongue are detectors of certain chemicals, and we can definitely make electronic detectors for chemicals and turn their signals into digital data, though we would need a large amount of different detectors to fully replicate the capabilities of human noses and tongues. This would be kind of awkward, not only because such a large amount of detectors could be kind of impractical, but also, a lot of these detectors would have very little use on their own. Say, we make carbon monoxide detectors to prevent people from getting poisoned, but that's because we humans cannot smell carbon monoxide. For chemicals we can already smell or taste, there isn't much incentive to make detectors for them, so it's kind of hard to even begin to collect data. Sense of touch is even more awkward, because it's much more "general" than the four senses we have talked about. And once again, we don't have much incentive to wrap a skin with neurons in it around a robot to carefully monitor... something about itself? That would be weird.

Quick note: there is actually another sense we could measure. The sense of gravity, which is measured by vestibular organs in our inner ear. The sense of gravity can also be replicated using gyroscope and accelerator. I'll just shoehorn this paragraph here as I can't be bothered to come up with a good transition and stuff. It's just purely FYI, you know. (LOL)

But wait, what are we trying to do here? Why are we trying to merely replicate our senses for AI to learn? What would they even need it for? Well... maybe they don't actually need it to function, but to understand human experience, they will absolutely need such data. Let's do a thought experiment, shall we? If someone's blind right after they're born, then they will not truly have concepts of things related to vision, say, color. They can only hear people describing things to have color. Say, they hear that their friend loves the color red, and could even go to a store to buy their friend a red dress for their birthday, though they will have to rely on the shop assistant to pick the correctly colored dress for them. Does this count as having understood what the color "red" is? Maybe not so quick. For instance, other people who have vision may understand that their friend loves a brownish dark red, but the crimson red dress the blind person bought is not quite going to cut it. Also, the pattern on the dress may matter, too, and this is simply impossible to fully and accurately describe using words. Of course, in no way the blind person's friend is going to be mad at them over such slight imperfection. I mean, how could they? The blind person is trying very hard, alright? Well... I don't think the same could be said about AI's "alignment problem". We're essentially blaming a born blind person, but the thing is, if they don't pick the exact right gift, they could murder us all.

Actually I would argue that, you, as a human, can't really understand your cat or dog, either. I mean, I don't have one, but... I'd say it's true by logical deduction. And that is simply because you don't have a cat or dog's brain, or their body. But cats and dogs at least have the same five senses as we do. Likewise, suppose an AI does become self-conscious, it'll be impossible for us to even begin to understand how it feels like to be a sentient AI, nor is it possible the other way around, i.e. for the AI to understand how it feels to be a human, without a perfect way to replicate our sense to it.

Alright, I understand all these logic deductions may be somewhat panic-inducing. So here's a question. Can two humans even truly understand each other? No, not really. You don't have someone else's brain, body, or their life experiences. And therefore, Jean-Paul Sartre famously said "Hell is other people", in reference to such perpetual ontological struggle. But I digress. By any means, in this light, does it really matter even if humans and AIs just fundamentally can't understand each other?

### Still Solving A Mathematical Optimization Problem

When I was a grad student at UCLA, I noticed that the school offered an artificial intelligence class to undergrads, but the class used Lisp, a <mark title="I know there're probably people who think it's the best language ever, but apparently it's so niche that highlight.js wouldn't highlight the syntax for any language from the lisp family. So you have to read the following code without syntax highlights. Sorry about that!">niche language</mark> that puts plus sign in the front and does everything in recursion. Well, I have used a dialect of Lisp called Racket when I was in UW, so I know a thing or two about it. In the most "purist" form, here's how you sum up an array in Racket:

```lisp
(define sum
  (lambda (arr)
    (if (null? arr)
        0
        (+ (car arr) (sum (cdr arr))))))
;; `car` means the first element of a list and `cdr` means the rest of the list
```

In comparison, here's how you write the same function in "normal" languages like Java:

```java
public int sum(int[] arr) {
    int sum = 0;
    for (int i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}
```

So, what's the big deal? Well, if you haven't noticed, there is no for loop in the Racket version! I wrote it in the recursion form and it is actually easier to write than its loop syntax! So why does the artificial intelligence class use such a "janky" language? Well, my guess is, they actually don't teach neural networks in the artificial intelligence class, but something more akin to decision trees, which is the technology used by IBM Deep Blue to beat Kasparov in chess back in 1997. And if you have some programming background, you'll know that recursion is awesome for traversing trees, which would explain why the class uses a language that force you to use recursion. It may sound like the technology of yesteryear now, but nonetheless it has once been the most cutting-edge "artificial intelligence".

So, what am I getting at here? Well, as people who have any amount of professional knowledge in this field would tell you, "artificial intelligence" is not one technology that's set in stone. Neural networks may be the definition of artificial intelligence today, but there's no guarantee that this is going to be the case forever.

But neural networks are doing so great! What major flaws do they have, then? Well, if you haven't seen the subtitle... Neural networks are basically just solving a mathematical optimization problem, i.e. finding the maximum or minimum value of a function. That is what the program is doing when you're "training" it. However, I don't think that's what a human brain does. Even though neural networks are designed to imitate human brains, here are a few arguments of mine as to how they're different:
1. By neural network's standard, human brains can only change "weights" very bluntly, and yet, human brains work orders of magnitudes more efficiently than the most cutting-edge neural networks today. There just has to be something that works fundamentally differently between the two, though I couldn't come up with a good guess what it is since I'm obviously no expert in either fields.
2. I think the reason why we're using neural networks to begin with is simply that __we know how to solve mathematical optimization problems progrmatically__. But most things in nature, when modeled in mathematical ways, are not programatically solvable.
3. This is tapping into existentialist philosophy a little bit, but human brains don't seem to be solving an optimization problem, because we have no goal to optimize for. Yes, all creatures, including humans, have desire to live and reproduce, but there's nothing in our body that's stopping us from choosing to not have kids or to kill ourselves (to put it bluntly), which even defies the goal of "winning in natural selection". Yes, our brains are somewhat optimized, but that's just the outcome of natural selection. I think fundamentally it is not built to optimize tasks. We exist first, and learn to be good at something later. However, neural network is the reverse. Models exist solely to be good at specific tasks, and a goal must be given during the training process for it to work.

Today, you can easily have an AI that's many times better at chess than IBM Deep Blue (11.38 GFLOPS) on your iPhone (in TFLOPS territory), not to mention decision tree is the dumb way to do things already. The same software used to beat world champion at chess cannot scale up to the point to beat human players at Go even with today's computing power, while neural network handled the task with ease, and even [beat human players at StarCraft with less clicks per minute](https://www.youtube.com/watch?v=cUTMhmVh1qs), which is actually many orders of magnitudes harder than Go for a computer to do. Perhaps years later we'll also look back at ChatGPT like how we look at IBM Deep Blue today. With how much anxiety about AI ChatGPT has stirred up, that is really some perspective to fathom. XD

## Epilogue

Back when Google published the [Transformer paper](https://research.google/pubs/attention-is-all-you-need/), which started all of these, I was still in grad school. And to me back then, it looked exactly the same as 200 other machine learning papers, because I had exactly 0 ideas what any of them was talking about. Now that I can actually kind of understand the synopsis, I'm feeling sort of amazed how simple of a concept Transformer actually is. As I understand it, conceptually it's just trying to be a network that handles sequential data, but with a much more enhanced attention mechanism than its predecessors. If you think about it, LSTM is trying to do that, too. It's written in its name, "Long Short-Term Memory". It's trying to be a step up of the RNN network. And if you read the GPT paper's synopsis, you could see, at the time, Google thought the Transformer network is best used for translation tasks. Who would have thought a few years later, people are discussing if such a network has become sentient or not. Of course, lots of work has been done after the initial paper, but still, conceptually, Transformer is maybe just a small step forward. It is the last straw that broke the camel's back.
