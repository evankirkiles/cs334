/*
 * util.h
 * author: evan kirkiles
 * created on Sun Oct 02 2022
 * 2022 the nobot space,
 */

#ifndef __UTIL_H__
#define __UTIL_H__

// rounds a function to the nearest tenth
double nearest_tenth(double v) {
  int c, r, m;
  m = v * 100;
  c = m % 10;
  r = m / 10;
  if (c >= 5) r++;
  return (double)r / 10;
}

#endif /* __UTIL_H__ */