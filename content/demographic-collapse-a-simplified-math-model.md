Demographic Collapse: A Simplified Math Model
========

## The Textbook Model

If you have taken a differential equation class in college, you have most definitely heard of the math modeling of population growth. It follows the differential equation below, where <span class="formula">P</span> represents the population, <span class="formula">t</span> means time, <span class="formula">k</span> is the rate of population change, and <span class="formula">N</span> is the growth limit:

```latex
$$
\frac{dP}{dt} = kP(N-P)
$$
```

If you solve for the equation, and give it a starting condition, then it results in a graph like this:

![Textbook model](/img/demographics-textbook-model.png)

The result is generally interpreted as: the population of a species, without the presence of its natural predators, will grow to the resource limit of the environment in an S-curve pattern.

The instructor will also probably tell you, that real-world data will probably have some noise, so the population will likely float around the eventual limit, rather than asymptotically approaching it as nicely as the graph shows.

But this model got me thinking, even back then. Because I watch anime and got exposed to quite some Japanese culture, I got to know Japan's population was already shrinking (or was projected to shrink, I don't exactly remember which case it was back then), and it definitely didn't look like floating around some limit, but rather, it was looking to be steadily declining over a course of perhaps one-to-two hundred years, until its population is halved or something. How can the model explain this case?

One might say, maybe in real world, there is some delay to people's reaction to over-population. Say, people may have a culture of having as many children as possible, so they kept having children, until the pressure of over-population _really_ kicked in. But still, this explanation feels unsatisfactory. You know, the model works very well in modeling the population of animal and microbe species, so, why should human be so different? Remind you, the explanation I just mentioned assumes the population can grow twice over limit because of... "culture" (LOL, no pun intended for you weebs who understand this joke). It almost renders the model useless. So that's how we're a quote-on-quote "intellectual" species? Personally, I don't find it so "intellectual" mindlessly following a cultural tradition of having many kids. If anything, that feels very "blind" and unintellectual!

Fast forward a decade, the demographic crisis is no longer an issue limited to Japan. Many advanced economies around the world are facing it. Fertility rate in the US and Europe are all below the replacement rate of 2.1, hovering around the level of 1.5 - 1.7. China's having this problem particularly acutely, as [it is implied that our fertility rate is maybe only above that of South Korea's](https://www.youtube.com/watch?v=cekVVi2EiJ8&t=134s). So, I want to get this over with, and provide a way to have an outlook on how the current trend might play out.

## Is The Model Wrong?

When trying to answer why Japanese are not having enough kids, many may associate it with Japan's housing crisis, and the high cost of living in expansive urban areas like Tokyo. But let's put that aside, and ask yourself a question: what if we suddenly halve the population of Tokyo? Then it's obvious that the cost of living is going to come down, broadly due to less competition. Say, landlords may no longer be able to easily find a tenant who's desperate to make some money in the big city, so they'll have to lower the price of their apartment rooms to have a better chance at renting it out. And, with lower housing prices, people will be able to spend their money elsewhere, say, on their kids' education, so, likely, people are going to have more kids. Of course, this will vary on an individual level, and there are a myriad of factors that will play a role in each person's decisions. But all in all, I think it's safe to say the declining population _will_ provide some perks for people to have more kids again. And if the population continues to shrink, likely the perks are going to get bigger, too. Some may come in the form of market factors, and some may come as government incentives, such as generous maternity leave policies or direct subsidies. Hmm... it's almost like we can also model this with differential equations!

And my epiphany came when I tried to figure out the unit of each variable in the equation we've mentioned before. I realized, in order for it to make sense, <span class="formula">N</span> must have the same unit as <span class="formula">P</span>, and therefore, <span class="formula">N</span> actually does not represent the "resource limit", but is just a straight-out population cap!

Now, things are more interesting. When it comes to resources, the advancement in technology actually helps us to extract more resources from our environment, hence the population growth. Now this cannot explain why population shrinks while we're extracting even more resources than before. But since the unit of <span class="formula">N</span> has to be "number of people", it's derived from:

```latex
$$
N = \frac{\text{Total resource available}}{\text{Average resource each person consumes}}
$$
```

And if the denominator of the above equation grows faster than the numerator, <span class="formula">N</span> is going to shrink. Think of what you need to live in a big city. If you're reading this you must have a computer (the page layout isn't designed for mobile LOL). Do you know how hard it is to turn sand into the computer chips you're using? And now think of someone from an African tribe, or maybe rural areas of some developing economies. They don't have a computer, and may have never seen a smart phone, and will only ever need at most one tenth of the clothing you currently own in your closet. Food is also a factor, though the discrepancy doesn't come from how many calories you consume every day comparing to people in poorer economies (and they actually can't be too different). Primarily it comes from food preparation. For starters, all the food you eat probably have been transported from somewhere at least somewhat remote from where you live, so there are costs of fossil fuel in every bite you take, whereas such costs won't arise if you're pulling the food out from your backyard. Living in the city is bad for environmental efficiency. What can I say? Anyway, clearly you'll need orders of magnitudes more resources to live, comparing to people living in poorer economies.

## Modeling Drifting Population Cap

Now that we have established that the <span class="formula">N</span> variable in the equation may not be a straight line that's sitting there, waiting for the population curve's asymptotic approach, maybe we _could_ model the population decline with the same differential equation that is taught in class after all. So, fine, <span class="formula">N</span> is no longer a constant, but also a function that changes with respect to the <span class="formula">t</span> variable. Then what? Then the differential equation becomes algebraically unsolvable, actually... But there's another mathematical tool we could use called "vector field", which can help us solve the equation numerically given a starting condition.

So, I wrote a python script to do exactly that:

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import ode

# Parameters
# ------------------------

xlim = (-4, 32)
ylim = (-2, 16)
grid_size = (25, 25)
figsize = (8, 6)

k = 0.05         # how fast population changes

pop_cap_0 = 3    # initial population cap
pop_cap_1 = 12   # peak population cap
pop_cap_2 = 6    # final population cap
x_kickoff = 7    # x coordinate when population cap rises
x_falloff = 16   # x corrdinate when population cap falls
x0, y0 = 4.8, 2.75    # initial condition

rounded_cap_corners = True

if rounded_cap_corners:
    x_pcap = np.linspace(xlim[0], xlim[1], grid_size[0] * 20)
    y_pcap = (pop_cap_1 - pop_cap_2) / (1 + np.exp(-2.5 * (x_falloff - x_pcap))) + pop_cap_2
    x_midpoint = (x_falloff + x_kickoff) / 2
    y_pcap[x_pcap <= x_midpoint] = (pop_cap_1 - pop_cap_0) / (1 + np.exp(-2.5 * (x_pcap[x_pcap <= x_midpoint] - x_kickoff))) + pop_cap_0
else:
    x_pcap = np.linspace(xlim[0], xlim[1], 25)
    y_pcap = np.ones(len(x_pcap)) * pop_cap_1
    y_pcap[x_pcap > x_falloff] = pop_cap_2
    y_pcap[x_pcap <= x_kickoff] = pop_cap_0


def population_cap(ti):
    return np.interp(ti, x_pcap, y_pcap)


def dPdt(ti, Pi):
    return k * Pi * (population_cap(ti) - Pi)


# Differential equation
# ------------------------

t, P = np.meshgrid(np.linspace(xlim[0], xlim[1], grid_size[0]), np.linspace(ylim[0], ylim[1], grid_size[1]))

dP = dPdt(t, P)
dt = np.ones(dP.shape)

# Solving ODE
# ------------------------

x = np.linspace(xlim[0], xlim[1], grid_size[0] * 20)
y = np.zeros(len(x))
r = ode(dPdt)

# forward direction
r.set_initial_value(y0, x0)
i0 = np.argmin(np.abs(x - x0))
y[i0] = y0
for i in range(i0 + 1, len(x)):
    y[i] = r.integrate(x[i])
    assert r.successful()

# backward direction
r.set_initial_value(y0, x0)
i0 = np.argmin(np.abs(x - x0))
y[i0] = y0
for i in range(i0 - 1, -1, -1):
    y[i] = r.integrate(x[i])
    assert r.successful()

# Draw plot
# ------------------------

plt.figure(figsize=figsize)
plt.quiver(t, P, dt, dP, color='gray')

# draw axes
plt.plot(xlim, [0, 0], c='k')
plt.plot([0, 0], ylim, c='k')

# draw population cap
plt.plot(x_pcap, y_pcap, 'k:', label='capacity')

# draw solution
plt.plot(x, y, c='g', label='population')

# info
plt.title('dP/dt = kP(N-P)')
plt.legend()

plt.xlim(xlim)
plt.ylim(ylim)
plt.xlabel('Time')
plt.ylabel('Population')
plt.show()
```

You can play around with the `k`, `pop_cap_1`, `pop_cap_2`, `pop_cap_3`, `x_kickoff`, `x_falloff`, `x0`, and `y0` parameters at the beginning of the script to have different configurations of the demographic changes. But here's the result of running the script without modifications:

![Drifting population cap](/img/demographics-drifting-cap.png)

As is shown, the speed of population cap changes is arbitrary and could totally move faster than the population can react (controlled by the `k` parameter). If this happens, population can go over the environmental limit, and hence come down, asymptotically approaching the new population cap from above.

The model suggests a few things:
1. Around the peak of the total population, we are likely going to observe a noticeable slowdown of population growth, then followed by a sharp drop
2. Even when the population drops, it is also always above the environmental limit

And it is the second point that's kind of scary, because this means the remaining population will likely need to compete for resources and will never live as comfortably as their ancestors did. Well, this kind of depends on how you define "comfort", of course. I mean, obviously I don't need to tell you that we're having a much higher quality of life comparing to those who came before us. We have longer life expectancy, better sanitary conditions, yada yada. But, say, people are going to be more stressed out about their rent, their kids' education, always feeling pressured in various ways. And the outcome is people simply end up having less kids. It is as if the environment is becoming less habitable, even though the quality of life is becoming better. As a matter of fact, your ancestors were probably more content about their lives than you are even though they're less educated and hungry more often. How can such seemingly contradictory things be true?

But if you think from an ecological standpoint, though, maybe it's not so contradictory. If there's some extremely advanced alien species that observes the Earth, so advanced that they look at our culture and technology like how we look at a beaver's dam or an ant colony, perhaps it would seem to them that indeed the environment has become less habitable. But this doesn't help to paint a very rosy picture. I mean, clearly, over-population is bad. And the implication of having the population to be always above the environmental limit is even grimmer. It means we're always going to take more than what we can comfortably extract from the environment, which will slowly deplete us of all useable resources. There are surely problems that could bite us in our rear down the road that we may not necessarily feel so urgent right now. For example, [by this Minute Earth's video](https://www.youtube.com/watch?v=O0BooiAxQyY), the world's phosphorus reserve that's used to make fertilizers can only last for about 300 years, and that is if politicians can put their sh!t together (LOL) and agree to share resources around the world fairly. Imagine our more technologically advanced great-great-great grandchildren just get hit by a good old famine in 300 years! Sure, science and technology can advance, but you'll still have to obey the conservation of elements! Well... Okay, maybe you can make phosphorus using nuclear fusion, too, but I wouldn't say that's the most economically viable fertilizer (LOL). And again, if we have come to the point of making fertilizers using nuclear fusion, we will likely feel immense pressure to have less kids, too.

If you're still not convinced, you know why we saw the most rapid increase in human population during the 20th Century? Wouldn't you know it, someone figured out a process to [make ammonia from literally thin air](https://www.youtube.com/watch?v=QQkmJI63ykI) (admittedly, by adding some hydrogen, though, LOL), which was used to make fertilizers!

Okay, wow, so originally I wanted to end this post on a more positive note, but now, by my own logical deduction, the future just looks really grim. I mean, over-population is an extremely hard problem to solve. Basically you have two ways out of it: one is to hope somehow the population just drops below the environmental limit (and man let's hope it's not by some catastrophe, natural or man-made); the other is to hope that our capability can grow faster than our greed, i.e. technology grows fast enough to meet our ever-growing demand and expectations (which is unlikely). But it's okay. That's why we _need_ to advocate for actions on environmental issues. That's why we _need_ to strive to push technologies forward. And perhaps we would need sort of a cultural shift, too, to learn to be more happy with less. Also, if you don't want to have kids, then it's totally okay to not have kids. End the cycle of kicking the can down the road, and work on making a better tomorrow for humanity's future generations.

Also, I want to stress that this model is very simplified. Over-simplified, perhaps. For example, the peak of the population will always cross with the declining population limit, which may not match with real-world data? Or at least it doesn't sound like a very satisfactory thing to deduct from the theory. Also, the "average resource each person consumes" is a very chaotic thing in itself, which can result in the population cap to constantly shift in unpredictable ways, so it may not look like a line split into three smooth segments like what is shown above after all. Remember it is the scientific spirit to be skeptic and critically analyze everything someone says, regardless whether they're some sort of an authority, expert, or guru. So, hey:

<p style="font-size: 40px; font-family: Times New Roman; font-style: italic; font-weight: bold;">
It's just a Theory! A Math Theory!
</p>

0x5468616e6b7320666f722072656164696e6721
