#!/usr/bin/env python

__author__ = 'agbeltran'

"""
Download Scientific Data ISA-tab files
"""
import urllib2
import os
import zipfile

def retrieve(url, timeout=30):
   return urllib2.urlopen(url, timeout=timeout).read()

def download(url, retrieved):
     #Download the file
    file_name = os.path.basename(url)
    file_mode = "w+"
    # Open local file for writing
    path = './data/'+file_name
    local_file = open(path, "wb" + file_mode)
    #Write to our local file
    local_file.write(retrieved)
    local_file.close()
    return file_name


if __name__ == '__main__':

    starting_year = 2014
    current_id = 1
    latest_successful_id = current_id

    published_year = starting_year
    accepted_year = starting_year

    #counter of consecutive errors trying to download a file
    error_count = 0

    while True:

        print "error_count = ", error_count

        #a single error might mean that the id was skipped (e.g. due to an editorial article)
        #two errors, increase the published year (assuming there won't be two consecutive editorials)
        if error_count == 2:
            published_year += 1
            current_id = latest_successful_id + 1
        elif error_count > 2:
            accepted_year += 1
            error_count == 0

        url_pieces = (published_year,accepted_year,current_id, accepted_year, current_id)
        url = 'http://www.nature.com/article-assets/npg/sdata/{0}/sdata{1}{2}/isa-tab/sdata{3}{4}-isa1.zip'.format(*url_pieces)

        try:
            retrieved = retrieve(url)
        #handle errors
        except urllib2.HTTPError, e:
            print "HTTP Error:",e.code , url
            error_count += 1
            current_id += 1
            continue
        except urllib2.URLError, e:
            print "URL Error:",e.reason , url
            error_count += 1
            current_id += 1
            continue

        error_count = 0

        file_name = download(url, retrieved)

        print 'Downloaded %r with %d bytes' % (url, len(retrieved))


        folder_name = './data/'+os.path.splitext(file_name)[0]
        full_file_name = './data/'+file_name
        #unzip
        zip_ref = zipfile.ZipFile(full_file_name, 'r')
        zip_ref.extractall(folder_name)
        zip_ref.close()

        latest_successful_id = current_id
        current_id += 1






















