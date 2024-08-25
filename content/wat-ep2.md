Wat: Episode 2
========

I believe it was during the last year of my undergradute studies in UW, when I came across this video simply titled [Wat](https://www.destroyallsoftware.com/talks/wat), during a club activity. It made fun of some Ruby's and Javascript's unintuitive features. [This article on Medium.com](https://medium.com/dailyjs/the-why-behind-the-wat-an-explanation-of-javascripts-weird-type-system-83b92879a8db) explained the Javascript jokes pretty well. However, the Medium article thinks the video is making fun of Javascript's type system, and comes to the conclusion that Javascript's type system "isn't all that bad" if you sort of catch the gist of it, which I think kind of missed the point... Well, not to say the video has a point to make, but I think it's in everyone's experience that some of these "language features" are so counter-intuitive that it's very easy for developers to accidentally write extremely obscure bugs. If I were to make a _Wat_ Episode 2, I would add a few more "jokes" to illustrate this point.

First of all, let's rehash a joke from the talk a little bit. Since I'm primarily a Python programmer, I'm going to compare Javascript to Python, which is also a dynamically typed language. And in Python, adding a list to a list actually makes sense:

```python
[] + []    # []
[1, 2] + ['a']    # [1, 2, 'a']
```

In case you have forgotten, in Javascript:

```javascript
[] + []    // ''
```

Okay, maybe "making sense" isn't the right phrase here, "intuitive" is. And whether a script language is "intuitive" is kind of subjective. So I'm not saying that Python is better here... except Python is just objectively superior in this case (LOL). Okay, why am I being mean to Javascript? What's this fuzz about? Well, Javascript didn't go through the redesigns like Python did, so some of its design choices remain stuck in 1995. Meanwhile, Python had the luxury to take feedbacks from developers and make backwards incompatible changes. When we talk about Python, nobody's referring to Python 1 anymore, and few are still talking about Python 2 because it has long passed its end of life. However, Javascript is kind of handicapped by its success: since it's so widely used in browsers, it doesn't have the luxury to push out backwards incompatible changes to fix "mistakes made". Hence some of Javascript's language features were quite out of fashion. They were a telling sign how people hadn't quite figured out how to do a script language yet.

Well, actually, forget about script languages. Back then, the coolest (new) kid in programming languages was... drum roll please... Tah dah! It was Java. Yea... so, looking back, 1995 was a time when people had only barely figured out how to do an object-oriented programming language. Speak of which, though, the fact that "Javascript" decided to have "Java" in its name is just extremely confusing. And this might be intentional, since Java applets were also fairly popular in the early ages of the web. However, the two languages couldn't be more different, bearing at most some skin-deep similarities in syntax. Javascript does try to incorporate some object-oriented features, but it's... it's so bad that it's better to not regard it as an OOP language.

And that is not an overstatement. Because there is one thing that Javascript borrowed from Java, a single keyword, that totally made sense in Java, but will absolutely strike fear into the souls of frontend developers. That is:

```javascript
this
```

...\*\*Sigh\*\* I will not even attempt to explain this. I'll just [put a link to this video](https://www.youtube.com/watch?v=kYAe7qDGOJw&t=640s) to explain it for me. This "language feature" is not even in the "if you have figured it out you'll think it's not that bad" territory! It's just pure pain. XD

Alright, let's stop making fun of languages that suck, let's continue to compare Javascript to Python!

In Python, "chained comparison" is a language feature. That is to say, you can do something like this:

```python
1 < 2 < 3    # True
```

So I was shocked to find out that Javascript seemingly has the same capability, because it allows you to do this:

```javascript
1 < 2 < 3    // true
````

...except that this is a fraud, because if you try to flip the operands and write it in the reverse order, you'll quickly find that it's not equivalent:

```javascript
3 > 2 > 1    // false
```

What is going on here, is that Javascript is comparing a boolean value to a number. And that is allowed, because Javascript is a "script language". So underneath what it thinks you mean is:

```javascript
1 < 2 < 3    // → true < 3 → 1 < 3 → true
3 > 2 > 1    // → true > 1 → 1 > 1 → false
```

The problem is, the program will actually not throw an error! One could easily see why it may cause some pretty obscure bugs.

What will cause even more obscure bugs, is Javascript's array's sort function, because:

```javascript
[1, 2, 3, 100, 15].sort()    // [1, 100, 15, 2, 3]
```

Sometimes `sort` doesn't sort the array! Okay, if you squint, you might have already figured out why. It _is_ sorting the array. It's just turning every element in the array into a string before comparing them. And that's Javascript's philosophy: it calls `toString()` method when in doubt about types. My guess is that Javascript picked this up from bash script... Anyhow, fortunately `sort` accepts a comparator function as its parameter, so there is a way to fix this:

```javascript
[1, 2, 3, 100, 15].sort((a, b) => a - b)    // [1, 2, 3, 15, 100]
```

But then you can also abuse it and shuffle the array this way:

```javascript
[1, 2, 3, 100, 15].sort((a, b) => 0.5 - Math.random())
```

...except this shuffle is also flawed, because the chance for each permutation isn't the same, and the time complexity is <mark title="You'll have to wait until the RNG generates the just right sequence to make the algorithm think the array is sorted.">pretty bad</mark>.

Python, in comparison:

```python
import random

arr = [1, 2, 3, 100, 15]

arr.sort()    # sort in place
sorted(arr)   # returns a new list: [1, 2, 3, 15, 100]

# in case you need to specify a custom sorting rule, Python asks you to provide a sorting key instead of a comparator function
arr.sort(key=lambda item: ...)
sorted(arr, key=lambda item: ...)
# the random module provides a shuffle method to shuffle the list in place
random.shuffle(arr)
# of course, you can also "hack" it and use a method similar to the Javascript shuffle method above, but it's easier to make the permutations "fair"
sorted(arr, key=lambda item: random.random())
```

And that's about it. Those are a few things in Javascript I think worth being brought up if the _Wat_ talk were to have an Episode 2.

# Bonus: The Ruby Jokes, Explained

I decided to write some bonus contents because the _Wat_ talk seems to have attracted more blog posts to explain its Javascript jokes than its Ruby jokes, but its Ruby jokes are also very much worth explaining. Particularly, its "ruby has bare words" joke may be confusing to many, because if you actually try it, it will likely not work. Why is that the case? Well, you'll soon see.

But first of all, here's a rehash of the Ruby function presented in the talk:

```ruby
def method_missing(*args)
    args.join(" ")
end
```

And if how it was written in the talk made you doubly confused, you should have figured out what it actually does by now. The way the above code was written in the talk was just to condense it into one line, with each line separated by a semicolon (;), which is nothing to write home about really. In Python, you could do the same thing. And if you come from a Python background, this syntax should also feel familiar in some other ways. Just note that instead of using a colon to indicate the start of a closure, in Ruby, we use the keyword `end` to indicate the end of a closure, so there's no strict indentation requirements like Python.

And just like how it is Python, `*args` here expands to a list of parameters, so if you call `method_missing(1, 2, 3, 4, 5)`, the `args` parameter becomes `[1, 2, 3, 4, 5]` within the function. Ruby also supports `**kwargs`, like Python, but also has a unique `&block` feature, which Python doesn't have. Though `&block` is related to Ruby's language syntax, which doesn't make sense in Python. If you're interested, [this Medium article](https://medium.com/@amliving/rubys-unary-operator-a93d36d3cd8b) did a pretty good introduction of this syntax.

Alright, now, if you have actually tried it yourself, done what Bernhardt (the lecturer) had done in the talk, you have most likely encountered some weird `SystemStackError`. What did you do wrong? Well, nothing! It's just that this trick no longer works in Ruby 1.9.3 and onward. By the [official download page](https://www.ruby-lang.org/en/downloads/releases/), version 1.9.3 came out on Oct 31, 2011, while 1.9.2 came out on Aug 18, 2010, and as the time of writing, the latest Ruby version is 3.2.3. As a matter of fact, while researching this, I can't even find version 1.9.2 of Ruby to install and play around with. It's not even available for download on the official page, and the oldest docker image is version 1.9.3, just after they (perhaps unintentionally) "patched" this broken feature. So, I can only speak from my experience with this language here.

So, why does Ruby even have this "secret feature" that allows it to have bare words? Well, actually, it's not a "secret feature". It's just abusing a few of the language's regular features. Firstly, Ruby allows you to call a function without parentheses. My guess is that this is a feature inspired by bash script, too. So, in Ruby, you can do:

```ruby
def my_method(a, b, c)
    puts a, b + c
end

my_method 1, 2, 3    # prints 1, followed by a newline, then 5
my_method(1, 2, 3)   # equivalent
```

Notice that you still need to separate multiple parameters with comma. But in typing "Ruby has bare words", Bernhardt used no comma. So what's happening here, is that you're turning every word you typed into a function call, i.e. it's equivalent to `Ruby(has(bare(words)))`! Also notice that the innermost layer is not regarded as a function call but a function passed as a parameter. Like many other script languages, Ruby also allows you to do that.

But clearly, you don't have these functions! And that's where the function you just wrote came in. As the name suggests, it is invoked when you can't find a function with corresponding name. But here's a small detail you might have noticed... The function doesn't use `return`! ...However, apparently that's just fine in Ruby. Because in Ruby, everything has a return! When you assign a value, say, `a = 2`, this expression has a return value, which is the assigned value, 2. When you define a function, the expression itself also has a return value, which is `nil` (equivalent to `None` and `null` in other languages). And here's the important part: in a Ruby function, if you don't explicitly call `return`, the function is going to return the return value of the last line of code executed! So, basically, it's okay to omit the `return` in the `method_missing` code given.

So, we pretty much have all the pieces here. When you have defined the `method_missing` function and typed "Ruby has bare words!", it will first execute `bare(words!)`. And yes, function names can end with exclamation mark in Ruby, hence Bernhardt saying "this is actually a result of how awesome Ruby is". The program then sees it needs to calculate `[words!].join(" ")` and converts the function into a string to finish the task, returning `"words!"`, thus starting the chain reaction that eventually spits out the whole sentence in the form of a string.

Good, now we know how and why it works. But wait, there's maybe one final question. Why does Ruby have this hidden top-level function (or global function) called `method_missing`? What kind of feature is the language trying to have by having this, and is there any other secret and "magical" top-level functions? Well, actually, this is not a mysterious top-level function... But firstly, we need to talk about how Ruby is trying to be a programming language that's object-oriented to the teeth.

In Ruby, absolutely _EVERYTHING_ is an object. And I mean _EVERYTHING_. Important things must be stressed thrice. So I'll say it again. _EVERYTHING_ (LOL). There is no primitive type so to speak. And objects all implement certain functions, and have certain properties. For example, you can do this in Ruby (before it was cool in Python LOL):

```ruby
1.to_s    # "1"
```

Admittedly, you can do this in Python 3, too. But back in the day, things are a little different:

```python
# In Python 2
1.bit_length()    # SyntaxError
a = 1
a.bit_length()    # this is ok
a.real            # yea, so 1 is totally an object in Python, too, but you just can't directly call 1.its_method_or_property

# In Python 3
1.bit_length()    # this is ok now
```

And just like the built-in function call `dir` in Python, in Ruby, you can achieve the same thing like this:

```ruby
1.methods
# [:to_s, :inspect, :-@, :+, :-, :*, :/, :div, :%, :modulo, :divmod, :fdiv, :**, :abs, :magnitude, :==, :===, :<=>, :>, :>=, :<, :<=, :~, :&, :|, :^, :[], :<<, :>>, :to_f, :size, :zero?, :odd?, :even?, :succ, :integer?, :upto, :downto, :times, :next, :pred, :chr, :ord, :to_i, :to_int, :floor, :ceil, :truncate, :round, :gcd, :lcm, :gcdlcm, :numerator, :denominator, :to_r, :rationalize, :singleton_method_added, :coerce, :i, :+@, :eql?, :quo, :remainder, :real?, :nonzero?, :step, :to_c, :real, :imaginary, :imag, :abs2, :arg, :angle, :phase, :rectangular, :rect, :polar, :conjugate, :conj, :between?, :nil?, :=~, :!~, :hash, :class, :singleton_class, :clone, :dup, :taint, :tainted?, :untaint, :untrust, :untrusted?, :trust, :freeze, :frozen?, :methods, :singleton_methods, :protected_methods, :private_methods, :public_methods, :instance_variables, :instance_variable_get, :instance_variable_set, :instance_variable_defined?, :remove_instance_variable, :instance_of?, :kind_of?, :is_a?, :tap, :send, :public_send, :respond_to?, :extend, :display, :method, :public_method, :define_singleton_method, :object_id, :to_enum, :enum_for, :equal?, :!, :!=, :instance_eval, :instance_exec, :__send__, :__id__]
```

So, where am I getting at? Well, since _EVERYTHING_ is an object in Ruby, the "main script", too, is an object. You can see this by opening `irb` and straight away type `self` and checkout out what it is (which is `main`, by the way). And all objects in Ruby can choose to implement a method called `method_missing`, which specifies the behavior when a non-existent method of this object is called. So, this is no mysterious global function. You're just defining it for the `main`.

Bernhardt ended the joke by saying "but if you actually do this" and showing a picture of Hong Kong's giant rubber duck. I think the joke here is "duck typing", as Ruby is a [duck-typing](https://en.wikipedia.org/wiki/Duck_typing) language. What that means is, the language will only check if a method with this name exists, regardless of what type of the object actually is, so you can imagine what kind of havoc someone will wreck by inserting such a one-liner somewhere in a giant project. Others have a typo in their code? Boom, it gets converted into a string, and the program never throws an error, so nobody realizes there is a bug until the code is pushed to production. So... please don't do that. XD

And now that's finally the complete picture of what's behind the `method_missing` joke. If you're interested in the explanation of other Ruby jokes in the talk, I searched Google a little and found [this article](https://missingtoken.net/2014/11/13/the-why-of-wat-ruby-edition/) that did a pretty good job.
