# VillagerDB

## Introduction
VillagerDB is an attempt to organize as much metadata as we
can about Animal Crossing. The scope of this
project is all of the main series video games, including:
Animal Forest, Animal Forest +, Animal Crossing,
Animal Forest e+, Wild World, City Folk and New Leaf. When
New Horizons is released, it will also be included in this
list. 

The overall goal of this project is to catalog all 
metadata across all main series games. Currently, 
the database only includes information on villagers.

## Format
Part of the goal of this project is to keep all of the
metadata in an easily used and publicly accessible format.
We have selected JSON for this purpose. This application
loads all metadata from disk at launch into a Redis cache. In
the future, this is likely to be a Redis and ElasticSearch
dependent app, with a further dependence on MySQL for
features such as tracking wishlists of items.

## Short-term goals
Short term, this project will be broken up into two GitHub
repositories: `villagerdb` and `villagerdb-data`. This
repository, `villagerdb`, contains the app which is live at
http://villagerdb.com/ on the `master` branch. On the other
hand, `villagerdb-data` will only contain the metadata
that populates the site. Any non-villager data, such as the
database schema for the MySQL portion of the site, will be
in this repository, `villagerdb`.

## Long-term goals
Quite simply we aim for this database to be as complete as
possible, spanning villagers and items from every main
series game in the franchise. This is a daunting task 
that will take quite some time and dedication to complete. 
All contributions are welcome and are very helpful in 
making this dream a reality.

## Contributing
Find bugs or want a feature? Submit a ticket and we will
investigate as time permits. Alternatively, send us a pull
request and we will discuss it with you. We look forward to
your help with this large project!